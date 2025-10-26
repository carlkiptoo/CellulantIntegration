import { validateStudent } from "../../services/student.service.js";

export const handleValidationRequest = async (req, res, next) => {
    const {studentId, amount, transactionRef} = req.body;

    if (!studentId || !amount) {
        return res.status(400).json({
            status: 'INVALID',
            message: 'Missing student ID or amount',
        });
    }

    try {
        const validationResult = await validateStudent(studentId);

        if (validationResult.status === 'VALID') {
            return res.status(200).json({
                status: 'VALID',
                message: validationResult.message,
                studentName: validationResult.name,
                transactionRef
            })
        } else {
            return res.status(200).json({
                status: 'INVALID',
                message: validationResult.message,
            })
        }
    } catch (error) {
        next(error);
    }
}