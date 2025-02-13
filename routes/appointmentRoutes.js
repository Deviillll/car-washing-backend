import express from "express";
import asyncHandler from "express-async-handler";
import AppointmentClass from "../controllers/appointmentController.js";
const appointmentRoute = express.Router();


appointmentRoute.post("/company-availability", asyncHandler(AppointmentClass.checkTimeAvailability));
appointmentRoute.post("/appointment", asyncHandler(AppointmentClass.createAppointment));
appointmentRoute.get("/appointments/:companyId", asyncHandler(AppointmentClass.getAppointments));
appointmentRoute.patch("/appointment/:appointmentId", asyncHandler(AppointmentClass.updateAppointment));
appointmentRoute.delete("/appointment/:appointmentId", asyncHandler(AppointmentClass.deleteAppointment));


export default appointmentRoute;