import express from 'express';
import customerMaster from '../controller/UserModule/customerMaster.mjs';
import employeeMaster from '../controller/UserModule/employeeMaster.mjs';
import statementOfAccount from '../controller/UserModule/statementOfAccount.mjs';
import customerPayments from '../controller/UserModule/payments.mjs'

const UserModule = express.Router();

UserModule.get('/customer', customerMaster.getCustomer);
UserModule.post('/customer', customerMaster.postCustomer);
UserModule.put('/customer', customerMaster.editCustomer);
UserModule.get('/customer/isCustomer', customerMaster.isCustomer);
UserModule.get('/BankDetails', customerMaster.BankDetails);

UserModule.get('/customer/payment', customerPayments.PaymentHistory);
UserModule.post('/customer/payment', customerPayments.manualPayment);
UserModule.post('/customer/payment/verification', customerPayments.manualPaymentVerification);

UserModule.get('/customer/getBalance', statementOfAccount.getBalance);
UserModule.get('/customer/StatementOfAccound', statementOfAccount.StatementOfAccound);
UserModule.get('/customer/paymentInvoiceList', statementOfAccount.paymentInvoiceList);
UserModule.get('/customer/invoiceDetails', statementOfAccount.invoiceDetails);
UserModule.get('/customer/customerSalesReport', statementOfAccount.customerSalesReport);
UserModule.get('/customer/salesInfo', statementOfAccount.salesInfo);

UserModule.get('/employee/designation', employeeMaster.emp_designation);
UserModule.get('/employee', employeeMaster.employeeGet);
UserModule.post('/employee', employeeMaster.employeePost);
UserModule.put('/employee', employeeMaster.employeePut);

export default UserModule;