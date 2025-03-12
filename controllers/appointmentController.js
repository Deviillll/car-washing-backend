import Appointment from "../models/appointment.js";
import Service from "../models/service.js";
import Schedule from "../models/timeTableModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import sendReceiptEmail from "../utils/mail/receiptMail.js";
import Stripe from "stripe";
import CompanyProfile from "../models/companyProfile.js";
import mongoose from "mongoose";

class AppointmentClass {
  static async checkTimeAvailability(req, res) {
    try {
      const { date, time, day,  company_id, services } = req.body;


      let smallDay = day.toLowerCase();

      // Check if all required fields are provided
      if (!time || !company_id || !services) {
        res.status(400);
        throw new Error("All fields are required");
      }
      if (!date && !day) {
        res.status(400);
        throw new Error("Date or day is required");
      }

      // campare the date with the current date if the date is less than the current date return error
      if (date) {
        const currentDate = new Date();
        const selectedDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < currentDate) {
          res.status(400);
          throw new Error("Date must be greater or equal than the current date");
        }
      }
      const objectId = mongoose.Types.ObjectId.createFromHexString(company_id);

      const validMongoId = mongoose.Types.ObjectId.isValid(objectId);
      if (!validMongoId) {
        res.status(400);
        throw new Error("Invalid company id");
      }

      const companyExist = await CompanyProfile.findById({ _id: objectId });

      if (!companyExist) {
        res.status(400);
        throw new Error("Company not found");
      }

      // Fetch the service details
      const serviceDetails = await Service.find({
        company: company_id,
        _id: { $in: services },
      });
    

      if (serviceDetails.length !== services.length) {
        res.status(400);
        throw new Error("One or more services not found");
      }

      // Calculate total service time (sum of all individual service times)
      const serviceTime = serviceDetails.reduce(
        (acc, service) => acc + parseInt(service.time),
        0
      );

      // Check if the schedule exists for the given duration and date

      // let schedule;
      // if (duration === "weekly") {
      //   schedule = await Schedule.findOne({ company_id, duration, day });
      // } else {
      //   schedule = await Schedule.findOne({
      //     company_id,
      //     duration,
      //     dates: { $in: [new Date(date)] },
      //   });
      // }
      let schedule = await Schedule.findOne({
        company_id,
        dates: { $in: [new Date(date)] },
      });
      
      if (!schedule) {
        schedule = await Schedule.findOne({ company_id, day:smallDay });
      }
      

      if (!schedule) {
        res.status(400);
        throw new Error("Schedule not found for the provided date or day");
      }

      if (!schedule.isActive) {
        res.status(400);
        throw new Error("Schedule is not active for the provided date or day");
      }
      function convertToMinutes(time) {
        const [hour, minute] = time.split(":");
        return parseInt(hour) * 60 + parseInt(minute);
      }

      // Convert time to minutes for comparison

      const startTimeInMinutes = convertToMinutes(time);

      // Calculate the end time in minutes (start time + total service time)
      const endTimeInMinutes = startTimeInMinutes + serviceTime;

      // Check if the requested time falls within company operating hours
      let isTimeValid = false;
      for (let i = 0; i < schedule.start.length; i++) {
        const companyStartTime = schedule.start[i];
        const companyEndTime = schedule.end[i];

        const companyStartTimeInMinutes = convertToMinutes(companyStartTime);
        const companyEndTimeInMinutes = convertToMinutes(companyEndTime);

        // Check if requested time fits within company's open hours

       

        if (
          startTimeInMinutes >= companyStartTimeInMinutes &&
          endTimeInMinutes <= companyEndTimeInMinutes
        ) {
          isTimeValid = true;
          break;
        }
      }

      if (!isTimeValid) {
        res.status(400);
        throw new Error("Your time is not within the company working hours.");
      }
      function convertToTimeFormat(minutes) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      }

      // Convert endTime back to HH:mm format
      const endTimeInHours = convertToTimeFormat(endTimeInMinutes);
      const startTimeInHours = convertToTimeFormat(startTimeInMinutes);

      // Check if any other appointment conflicts with the desired time slot

      let overlappingAppointment = await Appointment.findOne({
        company_id,
        appointmentDate: new Date(date),
       // appointmentDay: day,
        $or: [
          {
            // Appointment starts before the requested end time and ends after the requested start time
            appointmentTime: { $lt: endTimeInHours }, // Check if appointment starts before requested end time
            endTime: { $gt: startTimeInHours }, // Check if appointment ends after requested start time
          },
          {
            // Appointment starts after the requested start time and ends before the requested end time
            appointmentTime: { $gte: startTimeInHours }, // Check if appointment starts after requested start time
            endTime: { $lte: endTimeInHours }, // Check if appointment ends before requested end time
          },
        ],
      });
      


      //console.log(overlappingAppointment);

      if (companyExist.isMultipleBookingAllow && overlappingAppointment) {
        return res.status(200).json({
          status: 200,
          message: "Multiple Appointment available for the requested time slot",
        });
      }

      if (overlappingAppointment) {
        // Fetch all appointments for the requested date or day
        const appointments = await Appointment.find({
          company_id,
          appointmentDate: new Date(date),
          appointmentDay: day,
        });

        // Create an array of existing appointment start and end times
        const existingAppointmentTimes = appointments.map((appointment) => ({
          start: appointment.appointmentTime,
          end: appointment.endTime,
        }));

        // Respond with the overlap error and the list of existing appointment times
        res.status(400).json({
          status: 400,
          message:
            "The requested time slot overlaps with an existing appointment.",
          existingAppointments: existingAppointmentTimes, // Return existing appointment times
        });
        return;
      }

      // If no overlap, return available status
      res.status(200).json({
        status: 200,
        message: "Appointment time available",
        schedule,
      });
    } catch (error) {
      res.json({
        message: error.message,
      });
    }
  }
  static async createAppointment(req, res) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const {
      appointmentDate,
      appointmentTime,
      appointmentDay,
      company_id,
      email,
      vechile,
      services,
      name,
    } = req.body;

    if (
      !appointmentDate ||
      !appointmentTime ||
      !appointmentDay ||
      !company_id ||
      !email ||
      !vechile ||
      !services ||
      !name
    ) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const companyExist = await CompanyProfile.findById({ _id: company_id });

    if (!companyExist) {
      res.status(400);
      throw new Error("Company not found");
    }

    try {
      // Using a single query to fetch all services
      const serviceDetails = await Service.find({ _id: { $in: services } });

      if (serviceDetails.length !== services.length) {
        res.status(400);
        throw new Error("One or more services not found");
      }

      let totalPrice = 0;
      let totalTime = 0;
      let discount = 0;

      serviceDetails.forEach((service) => {
        totalPrice += service.price;
        totalTime += parseInt(service.time);
      });

      let finalPrice = totalPrice - (totalPrice * discount) / 100;

      function convertToMinutes(time) {
        const [hour, minute] = time.split(":");
        return parseInt(hour) * 60 + parseInt(minute);
      }

      // Utility function to convert minutes back to "HH:mm" format
      function convertToTimeFormat(minutes) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      }

      // Convert appointmentTime to minutes
      const startTimeInMinutes = convertToMinutes(appointmentTime);

      // Calculate endTime in minutes (add totalTime to start time)
      const endTimeInMinutes = startTimeInMinutes + totalTime;

      // Convert endTime back to HH:mm format
      const endTime = convertToTimeFormat(endTimeInMinutes);

      const appointment = new Appointment({
        company_id,
        name,
        email,
        vechile,
        services: serviceDetails,
        endTime, // Storing the calculated end time
        discount,
        finalPrice,
        appointmentDate,
        appointmentDay,
        appointmentTime,
        appointmentStatus: "pending",
      });

      await appointment.save();

      if (!appointment) {
        res.status(400);
        throw new Error("Appointment not created");
      }

      if (!companyExist.isAutoConfirmBookingAllow) {
        return res.status(201).json({
          status: 201,
          message: "Appointment created successfully",
          appointment,
        });
      }

      // Generate a PDF receipt for the appointment

      const doc = new PDFDocument();

      const filePath = `./receipts/receipt_${appointment._id}.pdf`;
      doc.pipe(fs.createWriteStream(filePath));

      // Add title
      doc
        .fontSize(18)
        .text("Appointment Receipt", { align: "center" })
        .moveDown(2);

      // Add company and appointment details
      doc
        .fontSize(12)
        .text(`Company: ${appointment.company_id}`, { align: "left" })
        .moveDown();
      doc
        .text(`Date: ${appointment.appointmentDate.toLocaleDateString()}`, {
          align: "left",
        })
        .moveDown();
      doc
        .text(`Time: ${appointment.appointmentTime}`, { align: "left" })
        .moveDown();
      doc
        .text(`Day: ${appointment.appointmentDay}`, { align: "left" })
        .moveDown();
      doc.text(`Name: ${appointment.name}`, { align: "left" }).moveDown();
      doc.text(`Email: ${appointment.email}`, { align: "left" }).moveDown();
      doc.text(`Vehicle: ${appointment.vechile}`, { align: "left" }).moveDown();

      // Add services details
      doc.text("Services:", { underline: true }).moveDown();
      serviceDetails.forEach((service) => {
        doc
          .text(`${service.name} - $${service.price}`, { align: "left" })
          .moveDown();
      });

      // Add total price and discount
      doc
        .text(`Total Price: $${appointment.finalPrice}`, { align: "left" })
        .moveDown();
      doc
        .text(`Discount: ${appointment.discount}%`, { align: "left" })
        .moveDown();

      // Add the total time of service
      doc
        .text(`Service End Time: ${appointment.endTime}`, {
          align: "left",
        })
        .moveDown();

      // Add a thank you note at the end
      doc
        .text("Thank you for using our service!", { align: "center" })
        .moveDown();

      // Finalize the PDF document
      doc.end();

      await sendReceiptEmail(appointment, filePath);

      // stripe payment

      const line_items = serviceDetails.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name, // Use the product name from the order item
          },
          unit_amount: parseInt(item.price) * 100,
        },
        quantity: 1,
      }));

      const session = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: "payment",
        success_url: `http://localhost:8000?success=true`, // Corrected URL
        cancel_url: `http://localhost:8000?success=false`, // Corrected URL
      });

      res.status(201).json({
        status: 201,
        message: "Appointment created successfully",
        appointment,
        session_id: session.id,
        session_url: session.url,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
  static async getAppointments(req, res) {
    const { companyId } = req.params;
    try {
      const companyExist = await CompanyProfile.findById(companyId);
      if (!companyExist) {
        res.status(400);
        throw new Error("Company does not exist");
      }
      const appointments = await Appointment.find({ company_id: companyId });
      if (!appointments || appointments.length < 1) {
        res.status(400);
        throw new Error("No appointments found");
      }

      res.status(200).json({
        status: 200,
        message: "Appointments retrieved successfully",
        appointments,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
  static async deleteAppointment(req, res) {
    const { appointmentId } = req.params;
    try {
      const appointment = await Appointment.findByIdAndDelete(appointmentId);
      if (!appointment) {
        res.status(400);
        throw new Error("Appointment not found");
      }

      res.status(200).json({
        status: 200,
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  static async updateAppointment(req, res) {
    const { appointmentId } = req.params;
    const { appointmentStatus } = req.body;
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { appointmentStatus },
        { new: true }
      );
      if (!appointment) {
        res.status(400);
        throw new Error("Appointment not found");
      }

      res.status(200).json({
        status: 200,
        message: "Appointment updated successfully",
        appointment,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
}
export default AppointmentClass;
