import express from 'express';

import AttendanceRouter from './attendance.mjs';
import AuthorizationRouter from './authorization.mjs';
import DashboardRouter from './dashboard.mjs';
import dataEntryRouter from './dataEntry.mjs';
import TopicsRouter from './discussionForem.mjs';
import MastersRouter from './masters.mjs';
import projectRoute from './projectsAndTasks.mjs';
import UserModule from './userModule.mjs';

const indexRouter = express.Router();

indexRouter.use('/empAttendance', AttendanceRouter);
indexRouter.use('/authorization', AuthorizationRouter);
indexRouter.use('/dashboard', DashboardRouter);
indexRouter.use('/dataEntry', dataEntryRouter);
indexRouter.use('/discussionForum', TopicsRouter);
indexRouter.use('/masters', MastersRouter);
indexRouter.use('/taskManagement', projectRoute);
indexRouter.use('/userModule', UserModule);

export default indexRouter;