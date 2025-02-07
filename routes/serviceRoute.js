import express from "express";
import asyncHandler from "express-async-handler";
import ServiceClass from "../controllers/serviceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const serviceRoute = express.Router();

serviceRoute.post(
  "/service",
  authMiddleware,
  asyncHandler(ServiceClass.createServices)
);
serviceRoute.post(
  "/category",
  authMiddleware,
  upload,
  asyncHandler(ServiceClass.addCatagory)
);

serviceRoute.get("/service", authMiddleware, asyncHandler(ServiceClass.getServices));
serviceRoute.get("/category", authMiddleware, asyncHandler(ServiceClass.getCatagory));

export default serviceRoute;