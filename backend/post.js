import express from "express";
import { Encrypted } from "./Secure.js";
import {v2 as cloudinary } from "cloudinary";
import Popup from "./Models/notificationStructure.js";
import Post from "./Models/postBlueprint.js";
import Subscriber from "./Models/userConfig.js";
const createPost = async (req, res) => {
try {
    const { text } =req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    
    const user = await Subscriber.findById(userId);
    if(!user) return res.status(404).json({message:"Subscriber not found"});
    if (!text && !img){
        return res.status(400).json({error:"Post must have something"});
        }
        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img,
        });
        await newPost.save();
        res.status(201).json(newPost);
    }
    catch(error){
        res.status(500).json({error:"Internal server error"});
        console.log("Error in creating Post.", error);
    }
};
const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});

        }
        if(post.user.toString() !==req.user._id.toString()){
            return res.status(401).json({error: "You are not authorized to delete this post"});
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Post deleted successfully"});
    }
    catch(error){
        console.log("Error in deleting Post. ", error);
        res.status(500).json({error:"Internal server error"});
    }
};
const PostComment = async(req, res) => {
    try{
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error:"Text is required"});
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"Post missing"});

        }
        const comment = { user: userId, text};
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    }
    catch(error){
        console.log("Error in Posting Comment", error);
        res.status(500).json({error:"Internal server error"});
    }
};
const likeUnlikePost = async (req,res) => {
    try{
        const userId = req.user._id;
        const{ id:postId } = req.params;
        const post = await Post.findById(postId);
        
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            await Post.updateOne({_id: postId}, {$pull:{likes:userId} });
            await Subscriber.updateOne({_id: userId}, {$pull:{likedPosts:postId} });
            const updatedlikes =post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        }
        else{
            post.likes.push(userId);
            await Subscriber.updateOne({_id: userId}, { $push: {likedPosts:postId}});
            await post.save();
            const notification =new Popup({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();
            const updatedLikes=post.Likes;
            res.status(200).json(updatedLikes);
        }
    }
    catch(error){
        console.log("Error in liking and unliking Post.",error);
        res.status(500).json({ error:"Internal server error"});
    }
};
const allPosts = async(req,res) => {
    try{
        const posts = await Post.find()
                    .sort({createdAt: -1})
                    .populate({
                    path:"user",
                    select: "-password",
                    })
                    .populate({
                    path:"comments.user",
                    select: "-password",
                    });
        if(posts.length === 0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    }
    catch(error){
        console.log("Error in showing All Posts.", error);
        res.status(500).json({error:"Internal server error"});
    }
};
const LikedPosts = async(req,res) => {
    const userId = req.params.id;
    try{
        const user = await Subscriber.findById(userId);
        if(!user) return res.status(404).json({error:"Subscriber Not found"});
        const likedPosts = await Post.find({_id:{$in:user.likedPosts} })
                    .populate({
                        path:"user",
                        select:"-password",
                    })
                    .populate({
                        path:"comments.user",
                        select:"-password",
                    });
        res.status(200).json(likedPosts);
    } 
    catch(error){
        console.log("Error in getting Liked Posts.",error);
        res.status(500).json({error: "internal server error"});
    }
};
const FollowingPosts = async(req,res)=> {
    try{
        const userId= req.user._id;
        const user = await Subscriber.findById(userId);
        if(!user) return res.status(404).json({error:"Subscriber not found"});
        const following = user.following;
        const feedPosts = await Post.find({user:{$in: following} })
                    .sort({createdAt: -1})
                    .populate({
                    path:"user",
                    select: "-password",
                    })
                    .populate({
                    path:"comments.user",
                    select: "-password",
                    });
        res.status(200).json(feedPosts);
    }
    catch(error){
        console.log("Error in FollowingPosts.",error);
        res.status(500).json({error:"Internal server error "});
    }
};
const subscriberPosts = async (req,res) =>{
    try{
        const { username } =req.params;
        const user= await Subscriber.findOne({username});
        if(!user) return res.status(404).json({error:"Subscriber not found"});
        const posts = await Post.find({user:user._id})
                    .sort({createdAt: -1})
                    .populate({
                    path:"user",
                    select: "-password",
                    })
                    .populate({
                    path:"comments.user",
                    select: "-password",
                    });
        res.status(200).json(posts);
    }
    catch(error){
        console.log("Error in getting Subscriber's Posts.", error);
        res.status(500).json({error: "Internal server error"});
    }
};
const router = express.Router();
router.get("/all", Encrypted, allPosts);
router.get("/following", Encrypted, FollowingPosts);
router.get("/likes/:id", Encrypted, LikedPosts);
router.get("/user/:username", Encrypted, subscriberPosts);
router.post("/create", Encrypted, createPost);
router.post("/like/:id", Encrypted, likeUnlikePost);
router.post("/comment/:id", Encrypted, PostComment);
router.delete("/:id",Encrypted, deletePost);
export default router;