import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
    name: string;
    age: number;
    grade: string;
    email: string;
    department: string;
};

const StudentSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    grade: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true }
});

StudentSchema.virtual('address', {
    ref: 'Address',
    localField: '_id',
    foreignField: 'studentId',
    justOne: true
})

StudentSchema.virtual("attendances", {
    ref: "Attendance",          // the model to use
    localField: "_id",          // Student._id
    foreignField: "studentId",  // Attendance.studentId
    justOne: false              // because one student can have many attendances
});

StudentSchema.set("toObject", { virtuals: true });
StudentSchema.set("toJSON", { virtuals: true });

export const StudentModel = mongoose.model<IStudent>("Student", StudentSchema)