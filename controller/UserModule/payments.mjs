import sql from 'mssql';
import { failed, invalidInput, servError, success, dataFound, noData } from '../../res.mjs';

const CustomersPayments = () => {

    const manualPayment = async (req, res) => {
        const { amount, bills, UserId, paymentType, TransactionId } = req.body;


        if (!Number.isFinite(amount) || amount <= 0) {
            return invalidInput(res, 'Invalid amount. Amount must be a positive number');
        }

        if (!Array.isArray(bills) || bills.length === 0) {
            return invalidInput(res, 'Invalid bills. Bills must be an array with at least one element');
        }

        if (!UserId) {
            return invalidInput(res, 'UserId Required');
        }

        try {

            const result = await new sql.Request()
                .input('UserId', UserId)
                .query(`SELECT Cust_Id FROM tbl_Customer_Master WHERE User_Mgt_Id = @UserId`);

            if (result.recordset.length === 0) {
                return res.status(400).json({ data: [], success: false, message: 'Customer Not Found', isCustomer: false });
            }

            const Cust_Id = result.recordset[0].Cust_Id;

            const transaction = await new sql.Transaction().begin();

            try {
                const paymentRequest = new sql.Request(transaction);
                paymentRequest.input('TransactionId', TransactionId);
                paymentRequest.input('Cust_Id', Cust_Id);
                paymentRequest.input('Bill_Count', bills.length);
                paymentRequest.input('Total_Amount', amount);
                paymentRequest.input('Payment_Type', paymentType);
                paymentRequest.input('Comp_Id', bills[0].Company_Id);
                const postPayment = await paymentRequest.query(`
                    INSERT INTO tbl_Payment_Order 
                        (Order_Id, Cust_Id, Bill_Count, Total_Amount, Payment_Status, Payment_Type, Comp_Id)             
                    VALUES 
                        (@TransactionId, CONVERT(BIGINT, @Cust_Id), @Bill_Count, CONVERT(DECIMAL(10, 2), @Total_Amount), 'ManualPay', @Comp_Id);
    
                    SELECT SCOPE_IDENTITY() AS Pay_Id;
                    `)

                if (postPayment.recordset && postPayment.recordset.length > 0) {
                    const Pay_Id = postPayment.recordset[0].Pay_Id;

                    for (const obj of bills) {
                        const detailsRequest = new sql.Request(transaction);
                        detailsRequest.input('Pay_Id', Pay_Id);
                        detailsRequest.input('Order_Id', TransactionId);
                        detailsRequest.input('Cust_Id', Cust_Id);
                        detailsRequest.input('Ledger_Name', Number(obj.tally_id));
                        detailsRequest.input('Bal_Amount', obj.Bal_Amount);
                        detailsRequest.input('Invoice_No', obj.invoice_no);
                        detailsRequest.input('Comp_Id', obj.Company_Id);

                        await detailsRequest.query(`
                            INSERT INTO tbl_Payment_Order_Bills 
                                (Pay_Id, Order_Id, Cust_Id, Ledger_Name, Bal_Amount, Invoice_No, Comp_Id) 
                            VALUES 
                                (@Pay_Id, @Order_Id, @Cust_Id, @Ledger_Name, @Bal_Amount, @Invoice_No, @Comp_Id)
                        `);
                    }

                    await transaction.commit();
                    success(res, 'Payment details saved');
                } else {
                    await transaction.rollback();
                    failed(res, 'Failed to create Order');
                }
            } catch (ee) {
                await transaction.rollback();
                servError(ee, res);
            }

        } catch (e) {
            servError(e, res)
        }
    }

    const PaymentHistory = async (req, res) => {
        const { paymentType, customerId, payStatus } = req.query;

        try {
            const queryType1 = `
            SELECT 
                c.Customer_name,
                c.Mobile_no,
                c.Email_Id,
                c.Contact_Person,
                c.Gstin,
                po.*,
                comp.Company_Name,
                COALESCE(( 
                    SELECT pob.* 
                        FROM tbl_Payment_Order_Bills AS pob 
                    WHERE po.Id = pob.Pay_Id 
                        FOR JSON PATH
                    ), '[]'
                ) AS PaymentDetails
            FROM 
                tbl_Payment_Order AS po
                JOIN tbl_Customer_Master AS c
                ON c.Cust_Id = po.Cust_Id
                JOIN tbl_DB_Name AS comp 
                ON po.Comp_Id = comp.Id
            WHERE 
                po.Payment_Type = ${paymentType} 
                AND po.Verified_Status = ${payStatus}`;

            const queryType2 = `
            SELECT 
                c.Customer_name,
                c.Mobile_no,
                c.Email_Id,
                c.Contact_Person,
                c.Gstin,
                po.*,
                comp.Company_Name,
                COALESCE(( 
                    SELECT pob.* 
                        FROM tbl_Payment_Order_Bills AS pob 
                    WHERE po.Id = pob.Pay_Id 
                        FOR JSON PATH
                    ), '[]'
                ) AS PaymentDetails
            FROM 
                tbl_Payment_Order AS po
                JOIN tbl_Customer_Master AS c
                ON c.Cust_Id = po.Cust_Id
                JOIN tbl_DB_Name AS comp 
                ON po.Comp_Id = comp.Id`;

            const queryType3 = `
            SELECT 
                c.Customer_name,
                c.Mobile_no,
                c.Email_Id,
                c.Contact_Person,
                c.Gstin,
                po.*,
                comp.Company_Name,
                COALESCE(( 
                    SELECT pob.* 
                        FROM tbl_Payment_Order_Bills AS pob 
                    WHERE po.Id = pob.Pay_Id 
                        FOR JSON PATH
                    ), '[]'
                ) AS PaymentDetails
            FROM 
                tbl_Payment_Order AS po
                JOIN tbl_Customer_Master AS c
                ON c.Cust_Id = po.Cust_Id
                JOIN tbl_DB_Name AS comp 
                ON po.Comp_Id = comp.Id
            WHERE 
                po.Payment_Type = '${paymentType}' 
                AND po.Verified_Status = '${payStatus}'
                AND po.Cust_Id = '${customerId}'`;

            let exequey;

            if (customerId && paymentType && payStatus) {
                exequey = queryType3;
            } else if (paymentType && payStatus) {
                exequey = queryType1
            } else {
                exequey = queryType2
            }

            const result = await sql.query(exequey);

            if (result.recordset.length > 0) {
                const parsedData = result.recordset.map(record => {
                    record.PaymentDetails = JSON.parse(record.PaymentDetails);
                    return record;
                });

                dataFound(res, parsedData)
            } else {
                noData(res);
            }

        } catch (e) {
            servError(e, res)
        }
    }

    const manualPaymentVerification = async (req, res) => {
        const { Pay_Id, description, verifiedDate, verifyStatus } = req.body;

        if (isNaN(Pay_Id) || !verifyStatus) {
            return invalidInput(res, 'Pay_Id and verifyStatus are required')
        }

        try {
            const query = `
                UPDATE 
                    tbl_Payment_Order
                SET 
                    Verified_Status = @verifyStatus,
                    Description = @description,
                    Verified_Date = @verifiedDate
                WHERE 
                    Id = @orderId`;

            const request = new sql.Request();
            request.input('orderId', Pay_Id);
            request.input('verifyStatus', verifyStatus);
            request.input('description', description);
            request.input('verifiedDate', verifiedDate ? verifiedDate : new Date());

            const result = await request.query(query);

            if (result && result.rowsAffected[0] > 0) {
                success(res, 'Status Verification Saved!');
            } else {
                failed(res, 'Unable to Save!');
            }

        } catch (e) {
            servError(e, res);
        }
    }

    return {
        manualPayment,
        PaymentHistory,
        manualPaymentVerification,
    }
}

export default CustomersPayments()