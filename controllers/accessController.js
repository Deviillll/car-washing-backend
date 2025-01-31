import asyncHandler from "express-async-handler";

export default class AccessController {
  static rootUrl = asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 200,
      message: "Welcome to the Appointment API",
    });
  });

  // Login, Validate, Register, Forgot Password, Reset Password
}
