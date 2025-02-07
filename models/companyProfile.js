import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      default: "",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: null,
    },

    street: {
      type: String,
      default: "",
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    website: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    isMultipleBookingAllow: {
      type: Boolean,
      default: false,
    },
    isAutoConfirmBookingAllow: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model(
  "tbl_companyprofile",
  companyProfileSchema
);

export default CompanyProfile;
