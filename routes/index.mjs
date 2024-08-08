import express from 'express';
import dataEntryRouter from './dataEntry.mjs';
import UserModule from './userModule.mjs';
import DashboardRouter from './dashboard.mjs';
import AuthorizationRouter from './authorization.mjs';
import AttendanceRouter from './attendance.mjs';
import MastersRouter from './masters.mjs';

const indexRouter = express.Router();

indexRouter.use('/authorization', AuthorizationRouter);
indexRouter.use('/dashboard', DashboardRouter);
indexRouter.use('/dataEntry', dataEntryRouter);
indexRouter.use('/userModule', UserModule);
indexRouter.use('/empAttendance', AttendanceRouter);
indexRouter.use('/masters', MastersRouter);

export default indexRouter;