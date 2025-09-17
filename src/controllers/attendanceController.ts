import { Context } from "koa";
import { StudentModel, AttendanceModel } from "../models";
import { errorResponse, successResponse } from "../utils/response";
import {
    StudentWithAttendances,
    StudentsResponse,
    AttendanceResponse,
    CreateAttendanceRequest,
    UpdateAttendanceRequest,
    ApiResponse
} from "../types/interface";

export const getAttendance = async (ctx: Context): Promise<void> => {
    try {
        const result: StudentsResponse = await StudentModel.find().populate('attendances');
        return successResponse(ctx, 200, "Students with attendance retrieved successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to retrieve students with attendance", error);
    }
};

export const getAttendanceById = async (ctx: Context): Promise<void> => {
    try {
        const id = String(ctx.params.id);
        const result: StudentWithAttendances | null = await StudentModel.findById(id).populate('attendances');

        if (!result) {
            return errorResponse(ctx, 404, "Student not found");
        }

        return successResponse(ctx, 200, "Student with attendance retrieved successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to retrieve student attendance", error);
    }
};

export const createAttendance = async (ctx: Context): Promise<void> => {
    try {
        const { studentId, date, status } = ctx.request.body as CreateAttendanceRequest;

        if (!studentId || !date || !status) {
            return errorResponse(ctx, 400, "StudentId, date, and status are required");
        }

        const student = await StudentModel.findById(studentId);
        if (!student) {
            return errorResponse(ctx, 404, "Student not found");
        }

        const result: AttendanceResponse = await AttendanceModel.create({
            studentId: student._id,
            date,
            status
        });

        return successResponse(ctx, 201, "Attendance created successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to create attendance", error);
    }
};

export const updateAttendance = async (ctx: Context): Promise<void> => {
    try {
        const id = String(ctx.params.id);
        const { date, status } = ctx.request.body as UpdateAttendanceRequest;

        if (!date && !status) {
            return errorResponse(ctx, 400, "At least one field (date or status) is required");
        }

        const result: AttendanceResponse | null = await AttendanceModel.findByIdAndUpdate(
            id,
            { ...(date && { date }), ...(status && { status }) },
            { new: true }
        );

        if (!result) {
            return errorResponse(ctx, 404, "Attendance not found");
        }

        return successResponse(ctx, 200, "Attendance updated successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to update attendance", error);
    }
};