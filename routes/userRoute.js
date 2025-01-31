import express from 'express';
import asyncHandler from 'express-async-handler';
import UserClass from '../controllers/userController.js';
import Company from '../controllers/companyController.js';
import authMiddleware from '../middlewares/authMiddleware.js';



const userRoute = express.Router();

userRoute.post('/register', asyncHandler(UserClass.registerUser)); 
userRoute.post('/login', asyncHandler(UserClass.loginUser));
userRoute.get("/verification/:id", asyncHandler(UserClass.verifyController)); 
userRoute.post('/forgotpassword', asyncHandler(UserClass.forgotPassword));
userRoute.post('/resetpassword/:id', asyncHandler(UserClass.resetPassword));
userRoute.post('/add-employee',authMiddleware, asyncHandler(Company.addEmployee));



export default userRoute;