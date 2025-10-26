# Makini University - Cellulant Payment Integration Service(MOCK)

A secure, fault-tolerant, and asynchronous payment integration between Makini University and Cellulant's Payment Gateway.

##  Project Overview

This service is engineered to:

- **Handle thousands of webhooks per second** without crashing
- **Prevent double deductions** through idempotent transaction processing
- **Ensure transactional accuracy** using PostgreSQL's ACID guarantees
- **Decouple webhook receipt from payment processing** using Redis as a message queue

##  Core Technical Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **API Layer** | Node.js (Express) | Fast, non-blocking I/O for concurrent webhook + validation requests |
| **Database** | PostgreSQL | ACID-compliant relational DB ensuring consistent financial records |
| **Message Queue** | Redis | High-speed asynchronous queue for webhook jobs + idempotency checks |
| **Language** | JavaScript (Node.js)

##  Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v15+)
- Redis (default port 6379)

##  Environment Configuration

Create a `.env` file in the root directory:

```env
# PostgreSQL Configuration
PG_USER=makini_admin
PG_HOST=localhost
PG_DATABASE=makini_db
PG_PASSWORD=********
PG_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_MAX_CONNECTIONS=20

# API & Environment
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Authentication
CELLULANT_BEARER_TOKEN=***********

# Stress Testing Config
MAX_CONCURRENT_REQUESTS=100
STRESS_TEST_URL=http://localhost:3000/debug/simulate/webhook
STRESS_TEST_STUDENT_ID=S004
STRESS_TEST_COUNT=100
STRESS_TEST_CONCURRENCY=10
```

##  Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/carlkiptoo/CellulantIntegration.git
cd makini_cellulant
```

### 2. Install Dependencies

```bash
npm install cors dotenv express pg node-fetch redis
```

### 3. Setup the Database

Run the seed command to create and populate initial data:

```bash
node src/db/seed.js
```

This creates:
- `students` table with mock staging data
- `payments` table with indexes and triggers

### 4. Start the Services

Run these commands in separate terminals:

| Service | Command | Purpose |
|---------|---------|---------|
| **API Server (Producer)** | `node src/server.js` | Handles incoming validation + webhook requests |
| **Worker Service (Consumer)** | `node src/workers/index.js` | Consumes jobs from Redis and updates PostgreSQL |

##  Authentication

All API endpoints are secured with Bearer Token authentication:

```
Authorization: Bearer <bearertoken>
```

This ensures only trusted internal systems can send requests.

##  API Endpoints

### Student Validation API

**Endpoint:** `POST /api/v1/validation`

Checks if the student is valid and active before payment.

**Request:**
```json
{
  "studentId": "S004"
}
```

**Response:**
```json
 {
    "status": "VALID",
    "message": "Student is active and valid",
    "studentName": "Joan Zuria"
}
```

### Payment Notification Webhook (Asynchronous)

**Endpoint:** `POST /api/v1/payment/notification`

Receives Cellulant transaction notifications.

**Request:**
```json
{
  "transactionId": "TXN_FINAL_101",
  "studentId": "S004",
  "amountPaid": 50000.00,
  "paymentMethod": "MPESA",
  "status": "SUCCESS",
  "timestamp": "2025-10-25T20:10:00Z"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Payment notification received and queued for processing"
}
```

 The API immediately returns `200 OK`  
 The Worker processes the job asynchronously, updating balances and inserting payment records

##  Stress Testing

A built-in simulation utility exists under `/debug/simulate/webhook`.

Test system performance under heavy concurrent webhook traffic:

```bash
node stressTest.js
```

##  Database Schema

###  students Table

| Column | Type | Notes |
|--------|------|-------|
| `student_id` | VARCHAR(50) | Primary key |
| `first_name` | VARCHAR(100) | Required |
| `last_name` | VARCHAR(100) | Required |
| `enrollment_status` | VARCHAR(20) | `ACTIVE` / `INACTIVE` |
| `current_balance` | DECIMAL(15,2) | Must be ≥ 0 |
| `email` | VARCHAR(150) | Unique |
| `created_at`, `updated_at` | TIMESTAMP | Auto-managed |

###  payments Table

| Column | Type | Notes |
|--------|------|-------|
| `transaction_id` | VARCHAR(100) | Primary key, idempotency key |
| `student_id` | VARCHAR(50) | FK → `students(student_id)` |
| `cellulant_ref` | VARCHAR(100) | Unique, optional |
| `amount_paid` | DECIMAL(15,2) | Must be > 0 |
| `payment_method` | VARCHAR(50) | `MPESA` / `CARD` / `BANK_TRANSFER` / `CASH` |
| `status` | VARCHAR(20) | `COMPLETED` / `FAILED` / `CANCELLED` / `PENDING` |
| `payment_date` | TIMESTAMP | Completion timestamp |
| `metadata` | JSONB | Optional payload details |
| `created_at`, `updated_at` | TIMESTAMP | Auto-managed triggers |

##  Design Guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| **Idempotency** | Duplicate transaction IDs rejected via DB uniqueness constraint |
| **Atomicity** | PostgreSQL transaction for payment + balance update |
| **Asynchronicity** | Redis queue decouples webhook listener and processing |
| **Fault Recovery** | Failed jobs can be retried from Redis safely |

##  Example Test Scenario(Using cellulant simulation)

**Student:** `S004`  
**Starting Balance:** 150,000.00  
**Payment Amount:** 50,000.00

###  Send Webhook

**Endpoint:** `http://localhost:3000/debug/simulate/validation/S001`

**Worker Logs:**
```
[TXN_COMPLETE] Transaction TXN_DEMO_001 successfully recorded for student S001.
```

###  Check Updated Balance

```sql
SELECT current_balance FROM students WHERE student_id = 'S004';
```

**Result:** `100,000.00` 

###  Retry Same Webhook

**Worker logs:**
```
[IDEMPOTENCY_BLOCK] Transaction TXN_DEMO_001 already processed.
```

**Balance remains unchanged** 


##  Key Features

-  **Production-grade architecture** with proper separation of concerns
-  **Event-driven design** using Redis queues
-  **Financial accuracy** with PostgreSQL ACID transactions
-  **Idempotent processing** prevents duplicate payments
-  **Scalable** handles high concurrent webhook load
-  **Fault-tolerant** with retry mechanisms

##  License

This project is licensed under the MIT License.
