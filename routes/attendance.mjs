import express from 'express';
import empAttendance from '../controller/Attendance/empAttendance.mjs'; 
const AttendanceRouter = express.Router();


AttendanceRouter.post('/attendance', empAttendance.addAttendance);
AttendanceRouter.put('/attendance', empAttendance.closeAttendance);
AttendanceRouter.delete('/attendance', empAttendance.closeAttendance);

AttendanceRouter.get('/myTodayAttendance', empAttendance.getMyTodayAttendance);
AttendanceRouter.get('/myAttendanceHistory', empAttendance.getAttendanceHistory);
AttendanceRouter.get('/getMyLastAttendance', empAttendance.getMyLastAttendance);



export default AttendanceRouter;