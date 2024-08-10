import sql from 'mssql';
import { checkIsNumber, ISOString } from '../../helper_functions.mjs';
import { dataFound, noData, success, failed, servError, invalidInput } from '../../res.mjs';

const EmployeeAndTasks = () => {

    const getMyTasks = async (req, res) => {
        const { Emp_Id, reqDate } = req.query;

        if (!checkIsNumber(Emp_Id)) {
            return invalidInput(res, 'Emp_Id is required');
        }

        try {
            const request = new sql.Request()
                .input('Work_Date', reqDate ? ISOString(reqDate) : ISOString())
                .input('Emp_Id', Emp_Id)
                .query(`
                    SELECT  
                        T.*, 
                        W.SNo,
                        W.Work_Id,
                        W.Work_Dt,
                        W.Work_Done,
                        Start_Time,
                        End_Time,
                        Tot_Minutes,
                        Work_Status,
                        COALESCE((
                            SELECT * 
                            FROM Task_Param_DT_Fn() 
                            WHERE Task_Id = T.Task_Id 
                            FOR JSON PATH
                        ), '[]') AS Param_Dts
                    FROM 
                        Task_Details_Fill_Fn() T 
                    LEFT JOIN 
                        Work_Master_Daily_Fn(@Work_Date, @Emp_Id) W 
                        ON T.AN_No = W.AN_No
                        AND T.Emp_Id = W.Emp_Id 
                    WHERE 
                        T.Emp_Id = @Emp_Id
                        AND CONVERT(date, Est_Start_Dt, 102) <= CONVERT(date, @Work_Date, 102)
                        AND CONVERT(date, Est_End_Dt, 102) >= CONVERT(date, @Work_Date, 102)
                    ORDER BY 
                        Ord_By ASC
                    `);

            const result = await request;

            if (result.recordset.length > 0) {
                return dataFound(res, result.recordset)
            } else {
                return noData(res)
            }
        } catch (e) {
            return servError(e, res);
        }
    }

    const todayTasks = async (req, res) => {
        const { Emp_Id } = req.query;

        if (!Number(Emp_Id)) {
            return invalidInput(res, 'Emp_Id is required')
        }

        try {
            const query = `
            SELECT 
                td.*,
                (SELECT Name FROM tbl_Users WHERE UserId = td.Assigned_Emp_Id) AS Assigned_Name,
                (SELECT Name FROM tbl_Users WHERE UserId = td.Emp_Id) AS EmployeeName,
                (
                    SELECT 
                        u.Name 
                    FROM 
                        tbl_Users AS u 
                    JOIN
                        tbl_Project_Master p
                        ON u.UserId = p.Project_Head 
                    WHERE 
                        p.Project_Id = td.Project_Id
                ) AS Project_Head_Name,
                (SELECT Task_Name FROM tbl_Task WHERE Task_Id = td.Task_Id) AS Task_Name,
                (SELECT Task_Desc FROM tbl_Task WHERE Task_Id = td.Task_Id) AS Task_Desc,
                (SELECT Project_Name FROM tbl_Project_Master WHERE Project_Id = td.Project_Id) AS Project_Name
            FROM 
                tbl_Task_Details AS td
            WHERE 
                td.Emp_Id = @emp
            AND 
                CONVERT(DATE, td.Est_Start_Dt) <= @date
            AND
                CONVERT(DATE, td.Est_End_Dt) >= @date
            ORDER BY 
                CONVERT(TIME, td.Sch_Time, 108)`

            const request = new sql.Request()
            request.input('emp', Emp_Id)
            request.input('date', new Date().toISOString().split('T')[0])

            const result = await request.query(query)

            if (result.recordset.length > 0) {
                dataFound(res, result.recordset)
            } else {
                noData(res)
            }

        } catch (e) {
            servError(e, res)
        }
    }

    

    return {
        getMyTasks,
        todayTasks,
    }
}

export default EmployeeAndTasks();