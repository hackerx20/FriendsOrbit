import mongoose from "mongoose";
const postBlueprint = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Subscriber",
            required: true,
        },
        text: {
            type:String,
        },
        img:{
            type: String,
        },
        likes:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Subscriber",
            },    
        ],
        comments: [
            {
                text: {
                    type:String,
                    required:true,
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"Subscriber",
                    required:true,
                },
            },
        ],
    },
    { timestamps: true }
);
const Post = mongoose.model("Post",postBlueprint);

export default Post;