import express from "express";
import asyncHandler from "express-async-handler";
import AppointmentClass from "../controllers/appointmentController.js";
const appointmentRoute = express.Router();


appointmentRoute.post("/company-availability", asyncHandler(AppointmentClass.checkTimeAvailability));
appointmentRoute.post("/create-appointment", asyncHandler(AppointmentClass.createAppointment));

export default appointmentRoute;