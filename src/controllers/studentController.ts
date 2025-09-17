import { Context } from "koa";
import { errorResponse, successResponse } from "../utils/response";
import { StudentModel, AddressModel } from "../models";
import {
    StudentWithAddress,
    StudentsResponse,
    CreateStudentRequest,
    UpdateStudentRequest,
    StudentResponse
} from "../types/interface";

// GET all students
export const getStudents = async (ctx: Context): Promise<void> => {
    try {
        const result: StudentsResponse = await StudentModel.find().populate('address');
        return successResponse(ctx, 200, "Students retrieved successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to retrieve students", error);
    }
};

// GET single student
export const getStudentById = async (ctx: Context): Promise<void> => {
    try {
        const id = String(ctx.params.id);
        const result: StudentWithAddress | null = await StudentModel.findById(id).populate('address');

        if (!result) {
            return errorResponse(ctx, 404, "Student not found");
        }

        return successResponse(ctx, 200, "Student retrieved successfully", result);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to retrieve student", error);
    }
};

// POST create student
export const createStudent = async (ctx: Context): Promise<void> => {
    try {
        const { name, age, grade, email, department, address } = ctx.request.body as CreateStudentRequest;

        if (!name || !age || !grade || !email || !department) {
            return errorResponse(ctx, 400, "Name, age, grade, email and department are required");
        }

        const student: StudentResponse = await StudentModel.create({
            name,
            age,
            grade,
            email,
            department
        });

        let createdAddress = null;
        if (address) {
            createdAddress = await AddressModel.create({
                studentId: student._id,
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country
            });
        }

        const responseData = {
            ...student.toJSON(),
            address: createdAddress
        };

        return successResponse(ctx, 201, "Student created successfully", responseData);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to create student", error);
    }
};

// PUT update student
export const updateStudent = async (ctx: Context): Promise<void> => {
    try {
        const id = String(ctx.params.id);
        const { name, age, grade, email, department, address } = ctx.request.body as UpdateStudentRequest;

        const student = await StudentModel.findById(id);
        if (!student) {
            return errorResponse(ctx, 404, "Student not found");
        }

        if (name) student.name = name;
        if (age) student.age = age;
        if (grade) student.grade = grade;
        if (email) student.email = email;
        if (department) student.department = department;

        await student.save();

        let updatedAddress = null;
        if (address) {
            updatedAddress = await AddressModel.findOneAndUpdate(
                { studentId: student._id },
                {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zip: address.zip,
                    country: address.country
                },
                { new: true, upsert: true }
            );
        }

        const updatedStudent = await StudentModel.findById(id).populate('address');
        return successResponse(ctx, 200, "Student updated successfully", updatedStudent);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to update student", error);
    }
};

// DELETE student
export const deleteStudent = async (ctx: Context): Promise<void> => {
    try {
        const id = String(ctx.params.id);

        const result = await StudentModel.findByIdAndDelete(id);
        if (!result) {
            return errorResponse(ctx, 404, "Student not found");
        }

        // Also delete related address
        await AddressModel.deleteMany({ studentId: id });

        return successResponse(ctx, 200, "Student deleted successfully", { id });
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to delete student", error);
    }
};
