
import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  description: {
    type: String,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
 time :{
    type: String,
    required: true,
 },
 category :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catagory",
 },
}, { timestamps: true });
const Service = mongoose.models.Service || mongoose.model("tbl_service", serviceSchema);
export default Service;