import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.STRESS_TEST_URL || "http://localhost:4000/debug/simulate/webhook";
const STUDENT_ID = process.env.STRESS_TEST_STUDENT_ID || "S004";
const STATUS = "success";
const TOTAL_REQUESTS = parseInt(process.env.STRESS_TEST_COUNT || "50");
const CONCURRENCY = parseInt(process.env.STRESS_TEST_CONCURRENCY || "10");

const requests = [];
const latencies = [];

const sendWebhook = async (id) => {
  const transactionId = `STRESS_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const amountPaid = Math.floor(Math.random() * 10000) + 1000;
  const url = `${BASE_URL}/${STUDENT_ID}/${STATUS}?transactionId=${transactionId}`;

  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({amount: amountPaid}),
    });
    const elapsed = performance.now() - start;
    latencies.push(elapsed);

    if (!response.ok) {
      const body = await response.text();
      console.error(`[FAIL] Request #${id}: ${response.status} ${body}`);
    } else {
      console.log(`[OK] Request #${id} (${elapsed.toFixed(2)} ms)`);
    }
  } catch (err) {
    console.error(`[ERROR] Request #${id}: ${err.message}`);
  }
};

const runBatch = async (startIndex, endIndex) => {
  const batch = [];
  for (let i = startIndex; i < endIndex; i++) {
    batch.push(sendWebhook(i + 1));
  }
  await Promise.all(batch);
};

const runStressTest = async () => {
  console.log(`🚀 Starting stress test with ${TOTAL_REQUESTS} requests (${CONCURRENCY} concurrent)...`);
  const startTime = performance.now();

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const end = Math.min(i + CONCURRENCY, TOTAL_REQUESTS);
    await runBatch(i, end);
  }

  const totalTime = performance.now() - startTime;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const maxLatency = Math.max(...latencies);
  const rps = (TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2);

  console.log("\n📊 --- Stress Test Summary ---");
  console.log(`Total Requests:   ${TOTAL_REQUESTS}`);
  console.log(`Concurrency:      ${CONCURRENCY}`);
  console.log(`Total Time:       ${totalTime.toFixed(0)} ms`);
  console.log(`Requests/sec:     ${rps}`);
  console.log(`Avg Latency:      ${avgLatency.toFixed(2)} ms`);
  console.log(`Max Latency:      ${maxLatency.toFixed(2)} ms`);
  console.log("-------------------------------");
};

runStressTest();
