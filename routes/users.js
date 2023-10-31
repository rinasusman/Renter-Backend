import express from 'express'
import { SendOtp, verifyOTP, LoginUser, logoutUser } from '../controller/userController.js';


const userRoute = express.Router();

userRoute.post("/sendotp", SendOtp);
userRoute.post('/verifyotp', verifyOTP);
userRoute.post("/login", LoginUser);
userRoute.post('/logout', logoutUser);

export default userRoute;