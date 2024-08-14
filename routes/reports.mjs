import express from 'express';
import dbconnect from '../middleware/otherDB.mjs';
import stockAndPurchase from '../controller/Reports/stockAndPurchase.mjs';
import template from '../controller/Reports/template.mjs';
import tallyReport from '../controller/Reports/tallyReport.mjs';

const ReportRouter = express.Router();

// stock Report
ReportRouter.get('/stockReport', dbconnect, stockAndPurchase.stockReport);
ReportRouter.get('/PurchaseOrderReportCard', dbconnect, stockAndPurchase.purchaseReport);
ReportRouter.get('/tally-test-api', stockAndPurchase.externalAPI);


ReportRouter.get('/template', template.getTemplates);
ReportRouter.post('/template/executeQuery', dbconnect, template.executeTemplateSQL);
ReportRouter.post('/template', template.insertTemplate);
ReportRouter.put('/template', template.updateTemplate);
ReportRouter.delete('/template', template.deleteTemplate);

ReportRouter.get('/tablesAndColumns', template.getTablesandColumnsForReport);


ReportRouter.get('/tallyReports/qPay', tallyReport.getQpayData);
ReportRouter.get('/tallyReports/productBased', dbconnect, tallyReport.productBasedSalesDetails);

ReportRouter.get('/tallyReports/qpay/columnVisiblity', tallyReport.getQPayColumns)
ReportRouter.post('/tallyReports/qpay/columnVisiblity', tallyReport.postColumnVisiblity)

ReportRouter.get('/tallyReports/qPay/salesTransaction', tallyReport.getSalesData)


export default ReportRouter;