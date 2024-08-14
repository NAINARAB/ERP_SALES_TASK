import sql from 'mssql';
import { dataFound, noData, invalidInput, servError } from '../../res.mjs';

const StockAndPurchaseReport = () => {

    const stockReport = async (req, res) => {
        const { ReportDate } = req.query;
        const guid = req.config.Tally_Guid;
        const company_id = req.config.Tally_Company_Id;

        if (!ReportDate) {
            return invalidInput(res, 'Report Date is Required')
        }

        try {
            const DynamicDB = new sql.Request(req.db);
            DynamicDB.input('guid', guid);
            DynamicDB.input('Company_Id', company_id.toString());
            DynamicDB.input('Fromdate', ReportDate);

            const StockReport = await DynamicDB.execute('Stouck_Abstract_Oinline_Search_New');

            if (StockReport && StockReport.recordset.length > 0) {
                StockReport.recordset.map(obj => {
                    obj.product_details = JSON.parse(obj.product_details)
                })
                return dataFound(res, StockReport.recordset)
            } else {
                return noData(res)
            }
        } catch (e) {
            servError(e, res)
        } finally {
            req.db.close()
        }
    }

    const purchaseReport = async (req, res) => {
        try {
            const { Report_Type, Fromdate, Todate } = req.query;
            const guid = req.config.Tally_Guid;

            const DynamicDB = new sql.Request(req.db);
            DynamicDB.input('Report_Type', Report_Type);
            DynamicDB.input('Guid', guid);
            DynamicDB.input('Fromdate', Fromdate)
            DynamicDB.input('Todate', Todate);

            const result = await DynamicDB.execute('Purchase_Order_Online_Report');
            if (Number(Report_Type) !== 3) {
                result.recordset.map(obj => {
                    obj.product_details = JSON.parse(obj.product_details)
                    obj.product_details.map(o => {
                        o.product_details_1 = JSON.parse(o.product_details_1)
                    })
                })
            } else {
                result.recordset.map(o => {
                    o.Order_details = JSON.parse(o.Order_details)
                })
            }
            if (result.recordset.length > 0) {
                dataFound(res, result.recordset)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        } finally {
            req.db.close()
        }
    }

    const externalAPI = async (req, res) => {
        try {
            const { Fromdate, Todate } = req.query;

            if (!Fromdate, !Todate) {
                return invalidInput(res, 'Fromdate, Todate is required')
            }
    
            const DynamicDB = new sql.Request();
            DynamicDB.input('Company_Id', 5);
            DynamicDB.input('Vouche_Id', 0);
            DynamicDB.input('Fromdate', Fromdate)
            DynamicDB.input('Todate', Todate);
    
            const result = await DynamicDB.execute('Online_Sales_API');
            if (result.recordset.length > 0) {
                const sales = JSON.parse(result.recordset[0]?.SALES)
                dataFound(res, sales)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    }

    return {
        stockReport,
        purchaseReport,
        externalAPI
    }
}

export default StockAndPurchaseReport();