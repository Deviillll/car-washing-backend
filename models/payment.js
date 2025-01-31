import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paymentID: {
            type: String
            
        },
        status: {
            type: Boolean,
            default: false,
        },
        total: {
            type: Number,
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    } );

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;