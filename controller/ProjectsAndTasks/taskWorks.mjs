import sql from 'mssql';
import { checkIsNumber, ISOString } from '../../helper_functions.mjs';
import { dataFound, noData, success, failed, servError, invalidInput } from '../../res.mjs';


const TaskWorks = () => {

    const getEmployeeWorkedTask = async (req, res) => {
        const { Emp_Id, reqDate } = req.query;

        if (isNaN(Emp_Id)) {
            return invalidInput(res, 'Emp_Id is required')
        }

        try {
            const query = `
            SELECT
                wm.*,
                p.Project_Name,
                t.Task_Name,
                u.Name AS EmployeeName,
                s.Status AS WorkStatus,

                COALESCE(
                    (SELECT Timer_Based FROM tbl_Task_Details WHERE AN_No = wm.AN_No), 
                    0
                ) AS Timer_Based,

                COALESCE(
                    (
                        SELECT
                            tp.*,
                            wpm.Current_Value,
                            pm.Paramet_Name,
                            pm.Paramet_Data_Type
                        FROM 
                            tbl_Task_Paramet_DT AS tp
                                
                            LEFT JOIN tbl_Paramet_Master AS pm 
                            ON pm.Paramet_Id = tp.Param_Id

                            LEFT JOIN tbl_Work_Paramet_DT AS wpm 
                            ON wpm.Work_Id = wm.Work_Id
                        WHERE
                            tp.Task_Id = wm.Task_Id
                            AND
                            tp.Param_Id = wpm.Param_Id
                        FOR JSON PATH
                    ), '[]'
                ) AS Param_Dts                
                
            FROM 
                tbl_Work_Master AS wm
            LEFT JOIN
                tbl_Project_Master AS p ON p.Project_Id = wm.Project_Id
            LEFT JOIN 
                tbl_Task AS t ON t.Task_Id = wm.Task_Id
            LEFT JOIN
                tbl_Users AS u ON u.UserId = wm.Emp_Id
            LEFT JOIN
                tbl_Status AS s ON s.Status_Id = wm.Work_Status
            LEFT JOIN
                tbl_Task_Details AS td ON td.Task_Levl_Id = wm.Task_Levl_Id
                
            WHERE 
                wm.Emp_Id = '${Emp_Id}'
                AND CONVERT(DATE, wm.Work_DT) = CONVERT(DATE, '${isValidDate(reqDate) ? reqDate : new Date()}')
                AND (wm.AN_No = td.AN_No OR wm.AN_No = 0)
                
            ORDER BY 
                wm.Start_Time`
            const result = await sql.query(query);

            if (result.recordset.length > 0) {
                result.recordset.map(o => {
                    o.Param_Dts = JSON.parse(o?.Param_Dts)
                })
                dataFound(res, result.recordset)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    }

    

}