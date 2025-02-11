import express from "express";
import asyncHandler from "express-async-handler";
import upload from "../middlewares/multerMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import Company from "../controllers/companyController.js";

const companyRoute = express.Router();

companyRoute.post(
  "/company-profile",
  authMiddleware,
  upload,
  asyncHandler(Company.createCompanyProfile)
);
companyRoute.get("/all-company", asyncHandler(Company.getAllCompaniesWithServices));
companyRoute.get("/company",authMiddleware, asyncHandler(Company.getCompanies));
companyRoute.delete("/company/:id",authMiddleware, asyncHandler(Company.deleteCompany));
companyRoute.get("/company/:id", authMiddleware, asyncHandler(Company.getCompany));
companyRoute.patch("/company", authMiddleware,upload, asyncHandler(Company.updateCompany));

export default companyRoute;
