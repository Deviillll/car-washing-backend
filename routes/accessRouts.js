import express from "express";
import AccessController from "../controllers/accessController.js";
const Router = express.Router();

Router.get("/", AccessController.rootUrl);

export default Router;
