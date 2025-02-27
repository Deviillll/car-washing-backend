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
serviceRoute.get("/service",  asyncHandler(ServiceClass.getServices));
serviceRoute.patch(
  "/service",
  authMiddleware,
  asyncHandler(ServiceClass.updateService)
);
serviceRoute.delete(
  "/service/:serviceId",
  authMiddleware,
  asyncHandler(ServiceClass.deleteService)
);



// Category




serviceRoute.post(
  "/category",
  authMiddleware,
  upload,
  asyncHandler(ServiceClass.addCatagory)
);

serviceRoute.get("/category", authMiddleware, asyncHandler(ServiceClass.getCatagory));

serviceRoute.patch(
  "/category",
  authMiddleware,
  upload,
  asyncHandler(ServiceClass.updateCatagory));

serviceRoute.delete(
  "/category/:categoryId",
  authMiddleware,
  asyncHandler(ServiceClass.deleteCatagory)
);
  
  

export default serviceRoute;