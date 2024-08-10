import sql from 'mssql';
import { failed, servError, success } from '../../res.mjs';


const appMenu = () => {

    const getMenu = async (req, res) => {
        const { Auth } = req.query;

        if (!Auth) {
            return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'Invalid Auth', success: false });
        }

        try {
            const request = new sql.Request();
            request.input('Autheticate_Id', Auth)

            const result = await request.execute('User_Rights_Side');
            if (result.recordsets.length > 0) {
                return res.status(200).json({ MainMenu: result.recordsets[0], SubMenu: result.recordsets[1], message: 'no Data', success: true });
            } else {
                return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'no Data', success: true });
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({ MainMenu: [], SubMenu: [], message: 'Server Error', success: false });
        }
    }

    const getUserRights = async (req, res) => {
        const { Auth } = req.query;

        if (!Auth) {
            return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'Invalid Auth', success: false });
        }

        try {
            const request = new sql.Request();
            request.input('Autheticate_Id', Auth)

            const result = await request.execute('User_Rights_Online');
            if (result.recordsets.length > 0) {
                return res.status(200).json({ MainMenu: result.recordsets[0], SubMenu: result.recordsets[1], message: 'no Data', success: true });
            } else {
                return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'no Data', success: true });
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({ MainMenu: [], SubMenu: [], message: 'Server Error', success: false });
        }
    }

    const modifyUserRights = async (req, res) => {
        const { MenuId, MenuType, User, ReadRights, AddRights, EditRights, DeleteRights, PrintRights } = req.body;

        try {
            const transaction = new sql.Transaction();

            await transaction.begin();

            try {
                const deleteQuery = `DELETE FROM tbl_User_Rights WHERE User_Id = @UserId AND Menu_Id = @MenuId AND Menu_Type = @MenuType`;
                await transaction.request()
                    .input('UserId', User)
                    .input('MenuId', MenuId)
                    .input('MenuType', MenuType)
                    .query(deleteQuery);

                const insertQuery = `
                    INSERT INTO tbl_User_Rights 
                        (User_Id, Menu_Id, Menu_Type, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights) 
                    VALUES 
                        (@UserId, @MenuId, @MenuType, @ReadRights, @AddRights, @EditRights, @DeleteRights, @PrintRights)`;
                const result = await transaction.request()
                    .input('UserId', User)
                    .input('MenuId', MenuId)
                    .input('MenuType', MenuType)
                    .input('ReadRights', ReadRights)
                    .input('AddRights', AddRights)
                    .input('EditRights', EditRights)
                    .input('DeleteRights', DeleteRights)
                    .input('PrintRights', PrintRights)
                    .query(insertQuery);

                if (result.rowsAffected[0] > 0) {
                    await transaction.commit();
                    return success(res, 'Changes saved successfully.');
                } else {
                    await transaction.rollback();
                    return failed(res, 'Failed to save changes.');
                }
            } catch (er) {
                await transaction.rollback();
                return servError(er, res)
            }
        } catch (e) {
            return servError(e, res)
        }
    }

    const getUserTypeRights = async (req, res) => {
        const { UserType } = req.query;

        if (!UserType) {
            return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'Invalid UserType', success: false });
        }

        try {
            const request = new sql.Request();
            request.input('UserTypeId', UserType)

            const result = await request.execute('User_Rights_By_User_Type');
            if (result.recordsets.length > 0) {
                return res.status(200).json({ MainMenu: result.recordsets[0], SubMenu: result.recordsets[1], message: 'no Data', success: true });
            } else {
                return res.status(400).json({ MainMenu: [], SubMenu: [], message: 'no Data', success: true });
            }
        } catch (e) {
            return res.status(500).json({ MainMenu: [], SubMenu: [], message: 'Server Error', success: false });
        }
    }

    const modifyUserTypeRights = async (req, res) => {
        const { MenuId, MenuType, UserType, ReadRights, AddRights, EditRights, DeleteRights, PrintRights } = req.body;

        try {
            const transaction = new sql.Transaction();

            await transaction.begin();

            try {
                const deleteQuery = `DELETE FROM tbl_User_Type_Rights WHERE User_Type_Id = @UserTypeId AND Menu_Id = @MenuId AND Menu_Type = @MenuType`;
                await transaction.request()
                    .input('UserTypeId', UserType)
                    .input('MenuId', MenuId)
                    .input('MenuType', MenuType)
                    .query(deleteQuery);

                const insertQuery = `
                    INSERT INTO tbl_User_Type_Rights 
                        (User_Type_Id, Menu_Id, Menu_Type, Read_Rights, Add_Rights, Edit_Rights, Delete_Rights, Print_Rights) 
                    VALUES 
                        (@UserTypeId, @MenuId, @MenuType, @ReadRights, @AddRights, @EditRights, @DeleteRights, @PrintRights)`;
                const result = await transaction.request()
                    .input('UserTypeId', UserType)
                    .input('MenuId', MenuId)
                    .input('MenuType', MenuType)
                    .input('ReadRights', ReadRights)
                    .input('AddRights', AddRights)
                    .input('EditRights', EditRights)
                    .input('DeleteRights', DeleteRights)
                    .input('PrintRights', PrintRights)
                    .query(insertQuery);

                if (result.rowsAffected[0] > 0) {
                    await transaction.commit();
                    return success(res, 'Changes saved.')
                } else {
                    await transaction.rollback();
                    return failed(res, 'Failed to save changes');
                }
            } catch (er) {
                await transaction.rollback();
                return servError(er, res)
            }
        } catch (e) {
            return servError(e, res)
        }
    }

    return {
        getMenu,
        getUserRights,
        modifyUserRights,
        getUserTypeRights,
        modifyUserTypeRights
    }
}

export default appMenu();