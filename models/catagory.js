import mongoose from "mongoose";
const catagorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
    description: {
        type: String,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    icon: {
        type: String,
    },
}, { timestamps: true });
const Catagory = mongoose.models.Catagory || mongoose.model("tbl_category", catagorySchema);
export default Catagory;