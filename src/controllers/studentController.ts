import { Context } from "koa";
import { errorResponse, successResponse } from "../utils/response";
import { IStudent, StudentModel } from "../models/Students_mongoDB";
import { AddressModel, IAddress } from "../models/Address_mongoDB";
import { IAttendance } from "../models/Attendance_mongoDB";

// let nextId = students.length + 1 || 1;

type ResultType = IStudent & { address: IAddress | null, attendance: IAttendance[] | null };

type CreateType = IStudent & { address: IAddress | null };

type UpdateType = IStudent & Partial<{ address: IAddress | null }>;


// GET all students
export const getStudents = async (ctx: Context) => {
    let result = await StudentModel.find().populate('address');
    return successResponse(ctx, 200, "Students retrieved successfully", result);
};

// GET single student
export const getStudentById = async (ctx: Context) => {
    const id = String(ctx.params.id);
    const result = await StudentModel.findById({ _id: id }).populate('address');
    if (!result) {
        return errorResponse(ctx, 404, "Student not found");
    }

    return successResponse(ctx, 200, "Students retrieved successfully", result);
};

// POST create student
export const createStudent = async (ctx: Context) => {
    const { name, age, grade, email, department, address } = ctx.request.body as CreateType;

    if (!name || !age || !grade || !email || !email || !department) {
        return errorResponse(ctx, 400, "Name, age, grade, email and department are required");
    }

    let student = await StudentModel.create({ name, age, grade, email, department });

    if (address) {
        await AddressModel.create({
            studentId: student._id,  // link student
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country
        });
    }
    return successResponse(ctx, 201, "Student created successfully", { ...student, address: address || null });
};

// PUT update student
export const updateStudent = async (ctx: Context) => {
    const id = String(ctx.params.id);
    const { name, age, grade, email, department, address } = ctx.request.body as UpdateType;

    const student = await StudentModel.findById({ _id: id });
    if (!student) {
        return errorResponse(ctx, 404, "Student not found");
    }

    if (name) student.name = name;
    if (age) student.age = age;
    if (grade) student.grade = grade;
    if (email) student.email = email;
    if (department) student.department = department;

    await student.save();

    if (address) {
        await AddressModel.create({
            studentId: student._id,  // link student
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country
        });
    }
    return successResponse(ctx, 200, "Student updated successfully", {});
};

// DELETE student
export const deleteStudent = async (ctx: Context) => {
    const id = String(ctx.params.id);

    const result = await StudentModel.findByIdAndDelete({ _id: id });
    if (!result) {
        return errorResponse(ctx, 404, "Student not found");
    }

    return successResponse(ctx, 204, "Student deleted successfully", "");
};
