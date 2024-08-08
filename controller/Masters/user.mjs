import sql from 'mssql'
import { servError, dataFound, noData, invalidInput, failed, success } from '../../res.mjs';
import { checkIsNumber, decryptPasswordFun, encryptPasswordFun } from '../../helper_functions.mjs';


const user = () => {

    const getUsers = async (req, res) => {
        const { Company_id } = req.query;

        if (checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is Required')
        }

        try {
            const query = `
            SELECT
                u.UserTypeId,
                u.UserId,
                u.UserName,
                u.Password,
                u.BranchId,
                b.BranchName,
                u.Name,
                ut.UserType,
                u.Autheticate_Id,
                u.Company_Id AS Company_id,
                c.Company_Name
            FROM 
                tbl_Users AS u
                LEFT JOIN tbl_Branch_Master AS b
                ON b.BranchId = u.BranchId
                LEFT JOIN tbl_User_Type AS ut
                ON ut.Id = u.UserTypeId
                LEFT JOIN tbl_Company_Master AS c
                ON c.Company_id = u.Company_Id
            WHERE 
                u.Company_Id = @comp 
                AND UDel_Flag = 0`;

            const request = new sql.Request();
            request.input('comp', Company_id);

            const result = await request.query(query);

            if (result.recordset.length > 0) {
                const encryptPassword = result.recordset.map(o => ({ ...o, Password: encryptPasswordFun(o.Password) }))
                const sorted = encryptPassword.sort((a, b) => a.Name.localeCompare(b.Name));
                dataFound(res, sorted)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res)
        }
    };

    const postUser = async (req, res) => {
        const { Name, UserName, UserTypeId, Password, BranchId, Company_id } = req.body;

        if (!Name || !UserName || !checkIsNumber(UserTypeId) || !Password || !checkIsNumber(BranchId) || !checkIsNumber(Company_id)) {
            return invalidInput(res, 'Name, UserName, UserTypeId, Password, Company_id and BranchId is required')
        }

        try {

            const checkTable = (await new sql.Request()
                .input('UserName', UserName)
                .query('SELECT UserId FROM tbl_Users WHERE UserName = @UserName')
            ).recordset

            if (checkTable.length > 0) {
                return failed(res, 'Mobile Number is already exist')
            }

            const request = new sql.Request(SFDB);
            request.input('Mode', 1);
            request.input('UserId', 0);
            request.input('Name', Name);
            request.input('UserName', UserName);
            request.input('UserTypeId', UserTypeId);
            request.input('Password', decryptPasswordFun(Password));
            request.input('BranchId', BranchId);
            request.input('Company_id', Company_id)

            const result = await request.execute('UsersSP');

            if (result.rowsAffected[0] > 0) {
                success(res, 'User created')
            } else {
                failed(res, 'Failed to create')
            }

        } catch (e) {
            servError(e, res)
        }
    }

    const editUser = async (req, res) => {
        const { UserId, Name, UserName, UserTypeId, Password, BranchId } = req.body;

        if (!checkIsNumber(UserId) || !Name || !UserName || !checkIsNumber(UserTypeId) || !Password || !checkIsNumber(BranchId)) {
            return invalidInput(res, 'UserId, Name, UserName, UserTypeId, Password and BranchId is required')
        }

        try {

            const checkTable = (await new sql.Request()
                .input('UserName', UserName)
                .input('user', UserId)
                .query('SELECT UserId FROM tbl_Users WHERE UserName = @UserName AND UserId != @user')
            ).recordset

            if (checkTable.length > 0) {
                return failed(res, 'Mobile Number is already exist')
            }

            const request = new sql.Request(SFDB);
            request.input('Mode', 2);
            request.input('UserId', UserId);
            request.input('Name', Name);
            request.input('UserName', UserName);
            request.input('UserTypeId', UserTypeId);
            request.input('Password', decryptPasswordFun(Password));
            request.input('BranchId', BranchId);
            request.input('Company_id', 0)


            const result = await request.execute('UsersSP');

            if (result.rowsAffected[0] > 0) {
                success(res, 'Changes Saved!')
            } else {
                failed(res, 'Failed to save changes')
            }

        } catch (e) {
            servError(e, res)
        }
    }

    const deleteUser = async (req, res) => {
        const { UserId } = req.body;

        if (!UserId) {
            return invalidInput(res, 'UserId is required')
        }

        try {
            const request = new sql.Request();
            request.input('Mode', 3);
            request.input('UserId', UserId);
            request.input('Name', 0);
            request.input('UserName', 0);
            request.input('UserTypeId', 0);
            request.input('Password', 0);
            request.input('BranchId', 0);
            request.input('Company_Id', 0);

            const result = await request.execute('UsersSP');

            if (result.rowsAffected[0] > 0) {
                return success(res, 'User deleted')
            } else {
                return failed(res, 'Failed to delete')
            }

        } catch (e) {
            servError(e, res);
        }
    }

    const userDropdown = async (req, res) => {
        const { Company_id } = req.query;

        if (checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is Required')
        }

        try {
            const result = (await new sql.Request()
                .input('Comp', Company_id)
                .query('SELECT UserId, Name FROM tbl_Users WHERE Company_id = @Comp')
            ).recordset;

            if (result.length > 0) {
                dataFound(res, result);
            } else {
                noData(res)
            }

        } catch (err) {
            return res.status(500).send(err)
        }
    };

    const employeeDropDown = async (req, res) => {
        const { Company_id } = req.query;

        if (checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is Required')
        }

        try {
            const result = (
                await sql.query(`
                    SELECT 
                        UserId, Name 
                    FROM 
                        tbl_Users 
                    WHERE 
                        UserTypeId = 3 
                        AND UDel_Flag = 0 
                        AND Company_id = @comp`
                )
            ).recordset;

            if (result.length > 0) {
                dataFound(res, result)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res);
        }
    }

    const getSalesPersonDropdown = async (req, res) => {
        const { Company_id } = req.query;

        if (checkIsNumber(Company_id)) {
            return invalidInput(res, 'Company_id is Required')
        }

        try {
            const result = (
                await sql.query(`
                    SELECT 
                        UserId, Name 
                    FROM 
                        tbl_Users 
                    WHERE 
                        UserTypeId = 6 
                        AND UDel_Flag = 0 
                        AND Company_id = @comp`
                )
            ).recordset;

            if (result.length > 0) {
                dataFound(res, result)
            } else {
                noData(res)
            }
        } catch (e) {
            servError(e, res);
        }
    }

    const changePassword = async (req, res) => {
        const { oldPassword, newPassword, userId } = req.body;

        if (!oldPassword || !newPassword || !checkIsNumber(userId)) {
            return invalidInput(res, 'oldPassword, newPassword, userId are required');
        }

        try {
            const checkPassword = `SELECT Password, UserName FROM tbl_Users WHERE UserId = @userId`;
            const request = new sql.Request().input('userId', userId);
            const result = await request.query(checkPassword);

            if (result.recordset[0] && result.recordset[0].Password === decryptPasswordFun(oldPassword)) {
                const UserName = result.recordset[0].UserName;
                const changePassword = new sql.Request();

                changePassword.input('Mode', 2);
                changePassword.input('UserName', UserName)
                changePassword.input('password', decryptPasswordFun(newPassword));

                const changePasswordResult = await changePassword.execute('Change_Paswword_SP');

                if (changePasswordResult.rowsAffected && changePasswordResult.rowsAffected[0] > 0) {
                    success(res, 'Password Updated')
                } else {
                    failed(res, 'Failed To Change Password')
                }

            } else {
                failed(res, 'Current password does not match');
            }
        } catch (e) {
            servError(e, res);
        }
    }



    return {
        getUsers,
        postUser,
        editUser,
        deleteUser,
        userDropdown,
        employeeDropDown,
        getSalesPersonDropdown,
        changePassword,
    }
}

export default user();