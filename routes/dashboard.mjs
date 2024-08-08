import express from 'express';
import DashboardController from '../controller/Dashboard/counts.mjs' 
const DashboardRouter = express.Router();

DashboardRouter.get('/dashboardData', DashboardController.getDashboardData);
DashboardRouter.get('/getTallyData', DashboardController.getTallyWorkDetails);
DashboardRouter.get('/employeeAbstract', DashboardController.getEmployeeAbstract);
DashboardRouter.get('/erp/dashboardData', DashboardController.getERPDashboardData);



export default DashboardRouter;