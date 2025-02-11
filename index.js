import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from "cors";
dotenv.config();

import errorHandler from "./middlewares/errorHnadlerMiddleware.js";
import connectDb from "./config/db/db.js";
connectDb();

import accessRoute from "./routes/accessRouts.js";
import roleRoute from "./routes/roleRoute.js";
import userRoute from "./routes/userRoute.js";
import companyRoute from "./routes/companyProfileRoute.js";
import serviceRoute from "./routes/serviceRoute.js";
import scheduleRoute from "./routes/timeTableRoutes.js";
import appointmentRoute from "./routes/appointmentRoutes.js";
import validateRoute from "./routes/validateRoute.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/", accessRoute);
app.use("/", roleRoute);
app.use("/", userRoute);
app.use("/", companyRoute);
app.use("/", serviceRoute);
app.use("/", scheduleRoute);
app.use("/", appointmentRoute);
app.use("/", validateRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.use(errorHandler);
