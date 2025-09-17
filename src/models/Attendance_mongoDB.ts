import mongoose, { Document } from "mongoose";

export interface IAttendance extends Document {
    studentId: mongoose.Types.ObjectId,
    date: string,
    status: string
}

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: String, required: true },
    status: { type: String, required: true }
});

// Fake DB
export const AttendanceModel = mongoose.model<IAttendance>("Attendance", AttendanceSchema);
