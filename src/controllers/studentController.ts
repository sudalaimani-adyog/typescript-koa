import { Context } from "koa";
import { errorResponse, successResponse } from "../utils/response";
import { StudentModel, AddressModel, AttendanceModel } from "../models";
import {
    StudentWithAddress,
    StudentsResponse,
    CreateStudentRequest,
    UpdateStudentRequest,
    StudentResponse,
    StudentSearchFilters,
    StudentWithAll
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

// GET all student details with filters (comprehensive search)
export const getStudentDetailsWithFilters = async (ctx: Context): Promise<void> => {
    try {
        const filters = ctx.query as StudentSearchFilters;

        // Build student query
        const studentQuery: any = {};

        // Student filters
        if (filters.name) {
            studentQuery.name = { $regex: filters.name, $options: 'i' };
        }
        if (filters.email) {
            studentQuery.email = { $regex: filters.email, $options: 'i' };
        }
        if (filters.department) {
            studentQuery.department = { $regex: filters.department, $options: 'i' };
        }
        if (filters.grade) {
            studentQuery.grade = filters.grade;
        }
        if (filters.minAge || filters.maxAge) {
            studentQuery.age = {};
            if (filters.minAge) studentQuery.age.$gte = parseInt(filters.minAge.toString());
            if (filters.maxAge) studentQuery.age.$lte = parseInt(filters.maxAge.toString());
        }

        // Pagination
        const page = parseInt(filters.page?.toString() || '1');
        const limit = parseInt(filters.limit?.toString() || '10');
        const skip = (page - 1) * limit;

        // Sorting
        const sortBy = filters.sortBy || 'name';
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        const sortQuery: any = { [sortBy]: sortOrder };

        // Get initial students with address populated
        let studentsQuery = StudentModel.find(studentQuery)
            .populate('address')
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        // Execute query to get students
        let students: StudentWithAll[] = await studentsQuery.lean();

        // Filter by address fields if provided
        if (filters.city || filters.state || filters.country) {
            students = students.filter((student: any) => {
                if (!student.address) return false;

                if (filters.city && !student.address.city?.toLowerCase().includes(filters.city.toLowerCase())) {
                    return false;
                }
                if (filters.state && !student.address.state?.toLowerCase().includes(filters.state.toLowerCase())) {
                    return false;
                }
                if (filters.country && !student.address.country?.toLowerCase().includes(filters.country.toLowerCase())) {
                    return false;
                }
                return true;
            });
        }

        // Get attendance for all students
        const studentIds = students.map((s: any) => s._id);
        const attendanceQuery: any = { studentId: { $in: studentIds } };

        // Add attendance filters
        if (filters.attendanceStatus) {
            attendanceQuery.status = filters.attendanceStatus;
        }
        if (filters.attendanceDate) {
            attendanceQuery.date = filters.attendanceDate;
        }
        if (filters.attendanceDateFrom || filters.attendanceDateTo) {
            attendanceQuery.date = {};
            if (filters.attendanceDateFrom) {
                attendanceQuery.date.$gte = filters.attendanceDateFrom;
            }
            if (filters.attendanceDateTo) {
                attendanceQuery.date.$lte = filters.attendanceDateTo;
            }
        }

        const attendances = await AttendanceModel.find(attendanceQuery).lean();

        // Group attendances by student
        const attendanceByStudent = attendances.reduce((acc: any, attendance: any) => {
            const studentId = attendance.studentId.toString();
            if (!acc[studentId]) {
                acc[studentId] = [];
            }
            acc[studentId].push(attendance);
            return acc;
        }, {});

        // Combine data
        const studentsWithFullDetails = students.map((student: any) => ({
            ...student,
            attendances: attendanceByStudent[student._id.toString()] || []
        }));

        // Get total count for pagination
        const totalCount = await StudentModel.countDocuments(studentQuery);

        const response = {
            students: studentsWithFullDetails,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            },
            filters: {
                applied: filters,
                availableFilters: {
                    departments: await StudentModel.distinct('department'),
                    grades: await StudentModel.distinct('grade'),
                    attendanceStatuses: await AttendanceModel.distinct('status')
                }
            }
        };

        return successResponse(ctx, 200, "Student details retrieved successfully", response);
    } catch (error) {
        return errorResponse(ctx, 500, "Failed to retrieve student details", error);
    }
};
