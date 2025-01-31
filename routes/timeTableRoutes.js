import express from "express";
import asyncHandler from 'express-async-handler';
import ScheduleClass from "../controllers/scheduleController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const timeTableRoute = express.Router();


timeTableRoute.post('/schedule',authMiddleware, asyncHandler(ScheduleClass.createSchedule) );
timeTableRoute.get('/schedule',authMiddleware, asyncHandler(ScheduleClass.getSchedule) );

export default timeTableRoute;