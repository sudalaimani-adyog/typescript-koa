import Router from 'koa-router';
import {
    createStudent,
    deleteStudent,
    getStudentById,
    getStudents,
    updateStudent,
    getStudentDetailsWithFilters
} from '../controllers/studentController';

const router = new Router({ prefix: "/api/students" });

router.get("/", getStudents);
router.get("/search/details", getStudentDetailsWithFilters);  // Must be before /:id route
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;