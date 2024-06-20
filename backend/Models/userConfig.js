import mongoose from "mongoose";
const userConfig = new mongoose.Schema(
    {
        username: {
            type:String,
            required:true,
            unique:true,
        },
        puraNaam: {
            type:String,
            required:true,    
        },
        password: {
            type:String,
            required:true,
            minLength: 8,    
        },
        email: {
            type:String,
            required:true,
            unique:true,    
        },
        userImage:{
            type:String,
            default:"",
        },
        bgImage: {
            type:String,
            default:"",
        },
        bio:{
            type: String,
            default: "",
        },
        link: {
            type: String,
            default: "",
        },
        followers: [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Subscriber",
                default: [],
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subscriber",
                default: [],
            },
        ],
        likedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Post",
                default: [],
            },
        ],
        
    },
    {timestamps: true}
);
const Subscriber = mongoose.model("Subscriber",userConfig);

export default Subscriber;