import express from "express";
import asyncHandler from "express-async-handler";
import ServiceClass from "../controllers/serviceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const serviceRoute = express.Router();

serviceRoute.post(
  "/service",
  authMiddleware,
  asyncHandler(ServiceClass.createServices)
);
serviceRoute.post(
  "/catagory",
  authMiddleware,
  asyncHandler(ServiceClass.addCatagory)
);

export default serviceRoute;