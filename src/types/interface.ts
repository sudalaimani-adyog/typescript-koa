import { IStudent, IAddress, IAttendance } from '../models';

// Base types from MongoDB models
export type StudentType = IStudent;
export type AddressType = IAddress;
export type AttendanceType = IAttendance;

// Populated types for controllers
export type StudentWithAddress = IStudent & { address?: IAddress };
export type StudentWithAttendances = IStudent & { attendances?: IAttendance[] };
export type StudentWithAll = IStudent & {
    address?: IAddress;
    attendances?: IAttendance[];
};

// Request body types
export type CreateStudentRequest = {
    name: string;
    age: number;
    grade: string;
    email: string;
    department: string;
    address?: Omit<IAddress, '_id' | 'studentId'>;
};

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

export type CreateAttendanceRequest = {
    studentId: string;
    date: string;
    status: string;
};

export type UpdateAttendanceRequest = Omit<CreateAttendanceRequest, 'studentId'>;

// Search filter types
export type StudentSearchFilters = {
    name?: string;
    email?: string;
    department?: string;
    grade?: string;
    minAge?: number;
    maxAge?: number;
    city?: string;
    state?: string;
    country?: string;
    attendanceStatus?: string;
    attendanceDate?: string;
    attendanceDateFrom?: string;
    attendanceDateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'age' | 'grade' | 'department' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
};

// Response types
export type ApiResponse<T = any> = {
    statusCode: number;
    message: string;
    data?: T;
    error?: any;
};

export type StudentResponse = StudentType | StudentWithAddress | StudentWithAttendances | StudentWithAll;
export type StudentsResponse = StudentResponse[];
export type AttendanceResponse = AttendanceType;
export type AttendancesResponse = AttendanceType[];