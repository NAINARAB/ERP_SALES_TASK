import express from 'express';
import customerMaster from '../controller/UserModule/customerMaster.mjs';

const UserModule = express.Router();

UserModule.get('/customer', customerMaster.getCustomer);
UserModule.post('/customer', customerMaster.postCustomer);
UserModule.put('/customer', customerMaster.editCustomer);
UserModule.get('/isCustomer', customerMaster.isCustomer);
UserModule.get('/BankDetails', customerMaster.BankDetails);



export default UserModule;