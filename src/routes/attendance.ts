import Router from 'koa-router';
import { getAttendance, createAttendance, updateAttendance, getAttendanceById } from '../controllers/attendanceController';

const router = new Router({ prefix: "/api/attendance" });

// router.get('/', async (cxt: Context) => {
//     cxt.body = { data: 10 };
// })

router.get("/", getAttendance);
router.get("/:id", getAttendanceById);
router.post("/", createAttendance);
router.put("/:id", updateAttendance);
router.delete("/:id", getAttendance);

export default router;