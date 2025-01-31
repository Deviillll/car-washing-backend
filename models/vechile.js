import mongoose from "mongoose";
// user schema
const userSchema = new mongoose.Schema({
   
    brand: {
        type: String,
        required: true,
      
    },
    model: {
        type: String,
        required: true,
    },
    year:{
        type:Number,
        required:true
    },user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
    

});


const Vechile = mongoose.models.Vechile || mongoose.model("Vechile", userSchema);
export default Vechile;