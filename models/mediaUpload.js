import mongoose from "mongoose";
const mediaUploadSchema = new mongoose.Schema({
  media: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "active",
  },
}, { timestamps: true });
const MediaUpload = mongoose.models.MediaUpload || mongoose.model("tbl_mediaUpload", mediaUploadSchema);
export default MediaUpload;