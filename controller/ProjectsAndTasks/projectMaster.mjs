import sql from 'mssql';
import { dataFound, noData, invalidInput, servError, success, failed } from '../../res.mjs'
import { checkIsNumber } from '../../helper_functions.mjs';


const projectController = () => {

    const getProjectDropDown = async (req, res) => {
        const { Company_id } = req.query;

        if (!checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is required');
        }

        try {
            const result = (await new sql.Request()
                .input('comp', Company_id)
                .query(`
                    SELECT 
                        Project_Id, Project_Name
                    FROM
                        tbl_Project_Master
                    WHERE
                        Company_id = @comp
                    `)
            ).recordset

            if (result.length > 0) {
                dataFound(res, result);
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    }

    const getProject = async (req, res) => {

        const { Company_id } = req.query;

        if (!checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is required');
        }

        try {
            const result = (await new sql.Request()
                .input('comp', Company_id)
                .query(`SELECT * FROM tbl_Project_Master WHERE Company_id = @comp`)
            ).recordset

            if (result.length > 0) {
                dataFound(res, result);
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    }

    const postProject = async (req, res) => {
        const { Project_Name, Project_Desc, Project_Head, Est_Start_Dt, Est_End_Dt, Project_Status, Entry_By, Company_id } = req.body;

        if (!Project_Name || !checkIsNumber(Company_id)) {
            return invalidInput(res, 'Project_Name, Company_id is required')
        }

        try {
            const request = new sql.Request()
                .input('Project_Name', Project_Name)
                .input('Project_Desc', Project_Desc)
                .input('Company_id', Company_id)
                .input('Project_Head', Project_Head)
                .input('Est_Start_Dt', Est_Start_Dt)
                .input('Est_End_Dt', Est_End_Dt)
                .input('Project_Status', Project_Status)
                .input('Entry_By', Entry_By)
                .input('Entry_Date', new Date())
                .query(`
                    INSERT INTO tbl_Project_Master
                        (Project_Name, Project_Desc, Company_id, Project_Head, Est_Start_Dt, Est_End_Dt, Project_Status, Entry_By, Entry_Date)
                        VALUES
                        (@Project_Name, @Project_Desc, @Company_id, @Project_Head, @Est_Start_Dt, @Est_End_Dt, @Project_Status, @Entry_By, @Entry_Date)
                    `)

            const result = await request;

            if (result.rowsAffected.length > 0) {
                success(res, 'Project added successfully');
            } else {
                failed(res, 'Failed to add project');
            }
        } catch (e) {
            servError(e, res)
        }
    };

    const editProject = async (req, res) => {
        const { Project_Id, Project_Name, Project_Desc, Base_Type, Project_Head, Est_Start_Dt, Est_End_Dt, Project_Status, Entry_By } = req.body;

        if (!Project_Id || !Project_Name) {
            return res.status(400).json({ success: false, message: 'Project_Id, Project_Name is Required', data: [] });
        }

        try {
            const request = new sql.Request()
                .input('Project_Id', Project_Id)
                .input('Project_Name', Project_Name)
                .input('Project_Desc', Project_Desc)
                .input('Project_Head', Project_Head)
                .input('Est_Start_Dt', Est_Start_Dt)
                .input('Est_End_Dt', Est_End_Dt)
                .input('Project_Status', Project_Status)
                .input('Update_By', Entry_By)
                .input('Update_Date', new Date())
                .query(`
                        UPDATE
                            tbl_Project_Master
                        SET
                            Project_Name = @Project_Name,
                            Project_Desc = @Project_Desc,
                            Project_Head = @Project_Head,
                            Est_Start_Dt = @Est_Start_Dt,
                            Est_End_Dt = @Est_End_Dt,
                            Project_Status = @Project_Status,
                            Update_By = @Update_By,
                            Update_Date = @Update_Date
                        WHERE
                            Project_Id = @Project_Id
                    `)

            const result = await request;

            if (result.rowsAffected.length > 0) {
                success(res, 'Changes Saved!')
            } else {
                failed(res, 'Failed to Save')
            }
        } catch (e) {
            servError(e, res)
        }
    }

    const deleteProject = async (req, res) => {
        const { Project_Id } = req.body;

        if (!Project_Id) {
            return invalidInput(res, 'Invalid Project_Id')
        }

        try {
            const request = new sql.Request()
                .input('Project_Id', Project_Id)
                .query(`DELETE FROM tbl_Project_Master WHERE Project_Id = @Project_Id`)

            const result = await request;

            if (result.rowsAffected.length > 0) {
                success(res, 'Project Deleted!')
            } else {
                failed(res, 'Failed to Delete')
            }
        } catch (e) {
            servError(e, res);
        }
    }

    const getProjectAbstract = async (req, res) => {
        const { Company_id } = req.query;

        if (!checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is required');
        }

        try {
            const request = new sql.Request()
                .input('comp', Company_id)
                .query(`
                    SELECT 
                    	p.Project_Id, 
                        p.Project_Name, 
                        p.Est_Start_Dt, 
                        p.Est_End_Dt,
                        (
                        	SELECT 
                        		COUNT(Sch_Id) 
                        	FROM 
                        		tbl_Project_Schedule 
                        	WHERE 
                        		Project_Id = p.Project_Id 
                        		AND 
                        		Sch_Del_Flag = 0
                        ) AS SchedulesCount,
                        (
                    	    SELECT 
                    	    	COUNT(Sch_Id) 
                    	    FROM 
                    	    	tbl_Project_Schedule 
                    	    WHERE 
                    	    	Project_Id = p.Project_Id 
                    	    	AND 
                    	    	Sch_Del_Flag = 0
                    	    	AND
                    	    	Sch_Status = 3
                    	) AS SchedulesCompletedCount,
                        (
                      	    SELECT 
                      	        COUNT(t.Task_Id) 
                    	    FROM 
                      	        tbl_Project_Schedule AS s
                    	        JOIN tbl_Project_Sch_Task_DT AS t 
                      	    	ON s.Sch_Id = t.Sch_Id
                            WHERE 
                              	s.Project_Id = p.Project_Id
                              	AND 
                    	    	t.Sch_Project_Id = p.Project_Id
                    	    	AND
                              	s.Sch_Del_Flag = 0
                              	AND
                              	t.Task_Sch_Del_Flag = 0
                        ) AS TasksScheduled,
                    	(
                    		SELECT 
                    			COUNT(A_Id)
                    		FROM
                    			tbl_Project_Sch_Task_DT
                    		WHERE
                    			Sch_Project_Id = p.Project_Id 
                    			AND
                    			Task_Sch_Status = 3
                    	) AS CompletedTasks,
                    	(
                    		SELECT
                    			COUNT(DISTINCT Task_Levl_Id)
                    		FROM 
                    			tbl_Task_Details
                    		WHERE
                    			Project_Id = p.Project_Id
                    	) AS TasksAssignedToEmployee,
                    	(
                    		SELECT 
                    			COUNT(DISTINCT  Task_Levl_Id)
                    		FROM 
                    			tbl_Work_Master
                    		WHERE
                    			Project_Id = p.Project_Id
                    	) AS TasksProgressCount,
                        (
                      	    SELECT
                    	    	  COUNT(DISTINCT Emp_Id)
                      	    FROM 
                      	    	tbl_Task_Details
                      	    WHERE 
                      	    	Project_Id = p.Project_Id
                    	    	  AND
                    	    	  Invovled_Stat = 1
                        ) AS EmployeesInvolved
                    FROM 
                        tbl_Project_Master AS p
                    WHERE 
                    	p.Project_Status != 3 
                        AND p.Project_Status != 4
                        AND p.Company_id = comp
                            `)
            const result = await request;

            if (result.recordset.length > 0) {
                dataFound(res, result.recordset)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    }

    const getStatusList = async (req, res) => {
        try {
            const result = (await new sql.query(`
                    SELECT Status_Id, Status 
                    FROM tbl_Status 
                    WHERE Status_Id!=0  
                    ORDER BY Status_Id
                `)).recordset;
            if (result.length > 0) {
                return dataFound(res, result)
            } else {
                return noData(res)
            }
        } catch (e) {
            return servError(e, res)
        }
    }

    return {
        getProjectDropDown,
        getProject,
        postProject,
        editProject,
        deleteProject,
        getProjectAbstract,
        getStatusList
    }
}

export default projectController()