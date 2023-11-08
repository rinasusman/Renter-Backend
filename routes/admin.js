import express from 'express'
import {
    LoginAdmin,
    logoutAdmin,
    clientListGet,
    blockUser,
    unBlockUser,
    AddCategory,
    categoryListGet,
    homeListGet,
    homeListGetverified,
    homeVerify
} from '../controller/adminController.js'
import { adminToken } from '../middleware/auth.js'

const adminRouter = express.Router();

adminRouter.post("/adminlogin", LoginAdmin);
adminRouter.post('/adminlogout', logoutAdmin);
adminRouter.get("/getClientList", clientListGet);
adminRouter.put('/userblock/:id', blockUser);
adminRouter.put('/userunblock/:id', unBlockUser);

adminRouter.post('/addCategory', AddCategory)
adminRouter.get("/getCategoryList", categoryListGet);

adminRouter.get("/getHomeList", homeListGet);
adminRouter.get("/getHomeListverified", homeListGetverified);
adminRouter.put('/homeverify/:id', homeVerify);


export default adminRouter; 