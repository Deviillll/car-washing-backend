import express from 'express';
const validateRoute = express.Router();
import asyncHandler from 'express-async-handler';
import validateController from '../controllers/validateController.js';


validateRoute.get('/validate', asyncHandler(validateController));

export default validateRoute;