import express from "express";
import asyncHandler from 'express-async-handler';
import ScheduleClass from "../controllers/scheduleController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const timeTableRoute = express.Router();


timeTableRoute.post('/schedule',authMiddleware, asyncHandler(ScheduleClass.createSchedule) );
timeTableRoute.get('/schedule/:companyId',authMiddleware, asyncHandler(ScheduleClass.getSchedule) );
timeTableRoute.patch('/schedule/:companyId',authMiddleware, asyncHandler(ScheduleClass.updateSchedule) );
timeTableRoute.delete('/schedule/:companyId',authMiddleware, asyncHandler(ScheduleClass.deleteSchedule) );
timeTableRoute.get('/single-schedule/:companyId',authMiddleware, asyncHandler(ScheduleClass.getSingleSchedule) );

export default timeTableRoute;