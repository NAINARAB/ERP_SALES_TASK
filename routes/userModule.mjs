import express from 'express';
import customerMaster from '../controller/UserModule/customerMaster.mjs';
import employeeMaster from '../controller/UserModule/employeeMaster.mjs';

const UserModule = express.Router();

UserModule.get('/customer', customerMaster.getCustomer);
UserModule.post('/customer', customerMaster.postCustomer);
UserModule.put('/customer', customerMaster.editCustomer);
UserModule.get('/isCustomer', customerMaster.isCustomer);
UserModule.get('/BankDetails', customerMaster.BankDetails);


UserModule.get('/employee/designation', employeeMaster.emp_designation);
UserModule.get('/employee', employeeMaster.employeeGet);
UserModule.post('/employee', employeeMaster.employeePost);
UserModule.put('/employee', employeeMaster.employeePut);

export default UserModule;