import express from 'express';
import company from '../controller/Masters/company.mjs';
import branch from '../controller/Masters/branch.mjs';
import user from '../controller/Masters/user.mjs';
import userType from '../controller/Masters/userType.mjs';
import taskType from '../controller/Masters/taskType.mjs';
import baseGroup from '../controller/Masters/baseGroup.mjs';

const MastersRouter = express.Router();

MastersRouter.get('/company', company.getCompany);
MastersRouter.post('/company', company.postCompany);
MastersRouter.put('/company', company.putCompany);
MastersRouter.delete('/company', company.deleteCompany);
MastersRouter.get('/company/dropDown', company.getCompanyDrowDown);


MastersRouter.get('/branch', branch.getBranch);
MastersRouter.post('/branch', branch.postBranch);
MastersRouter.put('/branch', branch.putBranch);
MastersRouter.delete('/branch', branch.deleteBranch);
MastersRouter.get('/branch/dropDown', branch.getBranchDrowDown);


MastersRouter.get('/users', user.getUsers);
MastersRouter.post('/users', user.postUser);
MastersRouter.put('/users', user.editUser);
MastersRouter.delete('/users', user.deleteUser);
MastersRouter.get('/user/dropDown', user.userDropdown);
MastersRouter.get('/users/employee/dropDown', user.employeeDropDown);
MastersRouter.get('/users/salesPerson/dropDown', user.getSalesPersonDropdown);
MastersRouter.put('/users/changePassword', user.changePassword);


MastersRouter.get('/userType', userType.getUserType);
MastersRouter.post('/userType', userType.postUserType);
MastersRouter.put('/userType', userType.editUserType);
MastersRouter.delete('/userType', userType.deleteUserType);


MastersRouter.get('/taskType', taskType.getTaskTyepe)
MastersRouter.get('/taskType/dropDown', taskType.TaskTypeDropDown)
MastersRouter.post('/taskType', taskType.postTaskType);
MastersRouter.put('/taskType', taskType.editTaskType);
MastersRouter.delete('/taskType', taskType.deleteTaskType);


MastersRouter.get('/baseGroup', baseGroup.getBaseGroup);
MastersRouter.post('/baseGroup', baseGroup.postBaseGroup);
MastersRouter.put('/baseGroup', baseGroup.editBaseGroup);
MastersRouter.delete('/baseGroup', baseGroup.deleteBaseGroup);



export default MastersRouter;

