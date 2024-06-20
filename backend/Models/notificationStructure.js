import mongoose from "mongoose";
const notificationStructure = new mongoose.Schema({
    from: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subscriber",
        required:true,
    },
    to: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subscriber",
        required:true,
    },
    type: {
        type:String,
        required: true,
        enum: ["follow","like"],
    },
    read:{
        type: Boolean,
        default: false,
    },
},
{ timestamps:true }
);
const Popup = mongoose.model("Popup", notificationStructure);

export default Popup;