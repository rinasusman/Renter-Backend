import express from 'express'
import { LoginAdmin, logoutAdmin, clientListGet, blockUser, unBlockUser, AddCategory } from '../controller/adminController.js'
import { adminToken } from '../middleware/auth.js'

const adminRouter = express.Router();

adminRouter.post("/adminlogin", LoginAdmin);
adminRouter.post('/adminlogout', logoutAdmin);
adminRouter.get("/getClientList", clientListGet);
adminRouter.put('/userblock/:id', blockUser);
adminRouter.put('/userunblock/:id', unBlockUser);

adminRouter.post('/addCategory', AddCategory)




export default adminRouter; 