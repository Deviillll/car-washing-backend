// create a model of user metadata
import mongoose from "mongoose";
const userMetaDataSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_user",
     required: true,
    },
    profile_image: {
      type: String,
      default: "",
    },
    phone: {
      type: Number,
      default: null,
    },
    city: {
      type: String,
      default: "",
    },
   
    zip: {
      type: String,
      default: "",
    },
    street: {
      type: String,
      default: "",
    },
},

   
    { timestamps: true }
);

const UserMetaData = mongoose.model("tbl_userMetaData", userMetaDataSchema);
export default UserMetaData;
