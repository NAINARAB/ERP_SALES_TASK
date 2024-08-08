import express from 'express';
import LoginController from '../controller/Authorization/login.mjs'; 


const AuthorizationRouter = express.Router();


AuthorizationRouter.post('/login', LoginController.login)
AuthorizationRouter.get('/userAuth', LoginController.getUserByAuth);

export default AuthorizationRouter;