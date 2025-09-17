import { Context } from "koa";
import { StudentModel } from "../models/Students_mongoDB";
import { errorResponse, successResponse } from "../utils/response";
import { AttendanceModel, IAttendance } from "../models/Attendance_mongoDB";

export const getAttendance = async (ctx: Context) => {
    let result = await StudentModel.find().populate('attendances');
    return successResponse(ctx, 200, "Students retrieved successfully", result);
};

export const getAttendanceById = async (ctx: Context) => {
    const id = String(ctx.params.id);
    const result = await StudentModel.findById({ _id: id }).populate('attendances');
    if (!result) {
        return errorResponse(ctx, 404, "Student not found");
    }
    return successResponse(ctx, 200, "Students retrieved successfully", result);
};

export const createAttendance = async (ctx: Context) => {
    const { studentId, date, status } = ctx.request.body as { studentId: string, date: string, status: string };

    let student: any = await StudentModel.findById({ _id: studentId });
    if (!student) {
        return errorResponse(ctx, 404, "Student not found");
    }
    const result = await AttendanceModel.create({ studentId: student._id, date, status });
    return successResponse(ctx, 200, "Attendance created successfully", result);
}
export const updateAttendance = async (ctx: Context) => {
    const id = String(ctx.params.id);
    const { date, status } = ctx.request.body as { date: string, status: string };
    const result = await AttendanceModel.findByIdAndUpdate({ _id: id }, { date, status }, { new: true });
    if (!result) {
        return errorResponse(ctx, 404, "Attendance not found");
    }
    return successResponse(ctx, 200, "Attendance updated successfully", result);
}