import express from 'express';
import projectMaster from '../controller/ProjectsAndTasks/projectMaster.mjs';
import tasksMaster from '../controller/ProjectsAndTasks/tasksMaster.mjs';
import taskActivity from '../controller/ProjectsAndTasks/taskActivity.mjs';

const projectRoute = express.Router();

projectRoute.get('/project/dropDown', projectMaster.getProjectDropDown);
projectRoute.get('/project', projectMaster.getProject);
projectRoute.get('/project/Abstract', projectMaster.getProjectAbstract);
projectRoute.post('/project', projectMaster.postProject);
projectRoute.put('/project', projectMaster.editProject);
projectRoute.delete('/project', projectMaster.deleteProject);
projectRoute.get('/statusList', projectMaster.getStatusList);

projectRoute.get('/tasks', tasksMaster.getTasks);
projectRoute.get('/tasks/dropdown', tasksMaster.getTaskDropDown);
projectRoute.post('/tasks', tasksMaster.createTask);
projectRoute.put('/tasks', tasksMaster.editTask);
projectRoute.delete('/tasks', tasksMaster.deleteTask);

projectRoute.get('/task/assignEmployee', taskActivity.getEmployeeAssignedInTheTask);
projectRoute.post('/task/assignEmployee', taskActivity.assignTaskForEmployee);
projectRoute.put('/task/assignEmployee', taskActivity.modifyTaskAssignedForEmployee);

// projectRoute.get('/task/workedDetails', taskActivity.getWorkedDetailsForTask);

// router.get('/startTask', workController.getTaskStartTime);
// router.post('/startTask', workController.postStartTime);
// router.delete('/startTask', workController.deleteTaskTime);

// router.post('/saveWork', workController.postWorkedTask);
// router.get('/myTodayWorks', workController.getEmployeeWorkedTask)

// router.get('/task/workDone', workController.getAllWorkedDataOfEmp)
// router.get('/workReport', workController.getAllWorkedData)
// router.get('/getGroupedTaskReport', workController.getAllGroupedWorkedData);
// router.get('/taskActivityReport', workController.taskWorkDetailsPieChart)
// router.get('/taskActivityReportBarChart', workController.taskWorkDetailsBarChart)

// router.get('/task/employeeInvolved', workController.EmployeeTaskDropDown);


export default projectRoute;