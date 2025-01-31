import mongoose from "mongoose";
const appointment = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_companyprofiles",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    vechile: {
      type: String,
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      }
    ],
    endTime: {
      type: String,
      
    },
    discount: {
      type: Number,

      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentDay: {
      type: String,
      required: true,
    },
    appointmentTime: {
      type: String,
      default: "00:00",
    },
    appointmentStatus: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);
const Appointment =
  mongoose.models.Appointment || mongoose.model("tbl_appointment", appointment);
export default Appointment;
