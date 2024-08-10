import express from 'express';
import LoginController from '../controller/Authorization/login.mjs'; 
import appMenu from '../controller/Authorization/appMenu.mjs';
import companyAccess from '../controller/Authorization/companyAccess.mjs';

const AuthorizationRouter = express.Router();


AuthorizationRouter.post('/login', LoginController.login)
AuthorizationRouter.get('/userAuth', LoginController.getUserByAuth);


AuthorizationRouter.get('/appMenu', appMenu.getMenu);

AuthorizationRouter.get('/userRights', appMenu.getUserRights);
AuthorizationRouter.post('/userRights', appMenu.modifyUserRights);

AuthorizationRouter.get('/userTypeRights', appMenu.getUserTypeRights);
AuthorizationRouter.post('/userTypeRights', appMenu.modifyUserTypeRights);

AuthorizationRouter.get('/companysAccess', companyAccess.getMYCompanyAccess);
AuthorizationRouter.post('/companysAccess', companyAccess.postCompanyAccess);


export default AuthorizationRouter;