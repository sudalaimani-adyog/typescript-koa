import Router from 'koa-router';
import { createStudent, deleteStudent, getStudentById, getStudents, updateStudent } from '../controllers/studentController';

const router = new Router({ prefix: "/api/students" });

// router.get('/', async (cxt: Context) => {
//     cxt.body = { data: 10 };
// })

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;