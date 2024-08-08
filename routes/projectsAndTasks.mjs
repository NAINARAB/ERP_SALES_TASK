import express from 'express';
import projectMaster from '../controller/ProjectsAndTasks/projectMaster.mjs';
import tasksMaster from '../controller/ProjectsAndTasks/tasksMaster.mjs';

const projectRoute = express.Router();

projectRoute.get('/project/dropDown', projectMaster.getProjectDropDown);
projectRoute.get('/project', projectMaster.getProject);
projectRoute.get('/project/Abstract', projectMaster.getProjectAbstract);
projectRoute.post('/project', projectMaster.postProject);
projectRoute.put('/project', projectMaster.editProject);
projectRoute.delete('/project', projectMaster.deleteProject);

projectRoute.get('/tasks', tasksMaster.getTasks)
projectRoute.get('/tasks/dropdown', tasksMaster.getTaskDropDown);
projectRoute.post('/tasks', tasksMaster.createTask);
projectRoute.put('/tasks', tasksMaster.editTask);
projectRoute.delete('/tasks', tasksMaster.deleteTask);


export default projectRoute;