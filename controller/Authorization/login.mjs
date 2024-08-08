import sql from 'mssql'
import { servError, dataFound, failed, invalidInput } from '../../res.mjs';
import { encryptPasswordFun } from '../../helper_functions.mjs';

const LoginController = () => {

    const login = async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return invalidInput(res, 'Invalid username or password')
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
              u.Company_id,
              c.Company_Name
    
            FROM tbl_Users AS u
    
            LEFT JOIN tbl_Branch_Master AS b
            ON b.BranchId = u.BranchId
    
            LEFT JOIN tbl_User_Type AS ut
            ON ut.Id = u.UserTypeId
    
            LEFT JOIN tbl_Company_Master AS c
            ON c.Company_id = u.Company_Id
    
            WHERE UserName = @UserName AND Password = @Password AND UDel_Flag= 0`;

            const loginReq = new sql.Request();
            loginReq.input('UserName', String(username).trim());
            loginReq.input('Password', encryptPasswordFun(password));

            const loginResult = await loginReq.query(query);

            if (loginResult.recordset.length > 0) {
                const userInfo = loginResult.recordset[0];
                const ssid = `${Math.floor(100000 + Math.random() * 900000)}${moment().format('DD-MM-YYYY hh:mm:ss')}`;

                const sessionSP = new sql.Request();
                sessionSP.input('Id', 0);
                sessionSP.input('UserId', userInfo.UserId);
                sessionSP.input('SessionId', ssid);
                sessionSP.input('LogStatus', 1);
                sessionSP.input('APP_Type', 1);

                const sessionResult = await sessionSP.execute('UserLogSP');

                if (sessionResult.recordset.length === 1) {
                    res.status(200).json({
                        user: userInfo, sessionInfo: sessionResult.recordset[0], success: true, message: 'login Successfully'
                    });
                }
            } else {
                res.status(400).json({ data: {}, success: false, message: 'Invalid username or password' });
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({ data: {}, success: false, message: 'Internal Server Error' })
        }
    }

    const getUserByAuth = async (req, res) => {
        const { Auth } = req.query;

        if (!Auth) {
            return invalidInput(res, 'Auth required');
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
                c.Company_Name,

                (
                    SELECT 
                        TOP (1)
                        UserId,
                        SessionId,
                        InTime
                    FROM
                        tbl_User_Log
                    WHERE
                        UserId = u.UserId
                    ORDER BY
                        InTime DESC
                        FOR JSON PATH
                )  AS session

            FROM tbl_Users AS u

            LEFT JOIN tbl_Branch_Master AS b
            ON b.BranchId = u.BranchId

            LEFT JOIN tbl_User_Type AS ut
            ON ut.Id = u.UserTypeId

            LEFT JOIN tbl_Company_Master AS c
            ON c.Company_id = u.Company_Id

            WHERE u.Autheticate_Id = @auth AND UDel_Flag= 0`;

            const request = new sql.Request();
            request.input('auth', Auth)

            const result = await request.query(query);

            if (result.recordset.length > 0) {
                result.recordset[0].session = result.recordset[0].session ? JSON.parse(result.recordset[0].session) : [{
                    UserId: result.recordset[0].UserId, SessionId: new Date(), InTime: new Date()
                }]
                return dataFound(res, result.recordset)
            } else {
                return failed(res, 'User Not Found')
            }
        } catch (e) {
            servError(e, res);
        }
    }

    return {
        login,
        getUserByAuth,
    }
}

export default LoginController()