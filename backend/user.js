import express from "express";
import {Encrypted} from "./Secure.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import Subscriber from "./Models/userConfig.js";
import Popup from "./Models/notificationStructure.js";

const getProfile = async (req, res) => {
    const { username }=req.params;
    try{
        const user = await Subscriber.findOne({username}).select("-password");
        if(!user) return res.status(404).json({message:"Subscriber not found"});
        res.status(200).json(user);
    }
    catch(error){
        console.log("Error in getting Profile.",error.message);
        res.status(500).json({error:error.message});
    }
};
const followUnfollowUser = async(req, res) =>{
    try{
        const { id }= req.params;
        const userToModify = await Subscriber.findById(id);
        const currentUser = await Subscriber.findById(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({error:"You can't follow/unfollow yourself"});
        }
        if(!userToModify || !currentUser) return res.status(400).json({error:"Subscriber not found"});
        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            await Subscriber.findByIdAndUpdate(id, {$pull:{followers: req.user._id} });
            await Subscriber.findByIdAndUpdate(req.user._id,{$pull:{following: id }});
            res.status(200).json({message:"Subscriber unfollower successfully"});
        }
        else{
            await Subscriber.findByIdAndUpdate(id, {$push:{followers: req.user._id} });
            await Subscriber.findByIdAndUpdate(req.user._id,{$push:{following: id }});
            const newNotification = new Popup({
                type:"follow",
                from: req.user._id,
                to: userToModify._id,
            });
            await newNotification.save();
            res.status(200).json({message:"Subscriber followed successfully"});
        }
    }
    catch(error){
        console.log("Error in the followUnfollowUser:", error.message);
        res.status(500).json({error:error.message});
    }
};
const suggestUsers = async (req,res) => {
    try{
        const userId =req.user._id;
        const usersFollowedByMe = await Subscriber.findById(userId).select("following");
        const users = await Subscriber.aggregate([
            {
                $match: {
                    _id: {$ne:userId },
                },
            },
            { $sample: {size:10}},
        ]);
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);
        suggestedUsers.forEach((user) => (user.password = null));
        res.status(200).json(suggestedUsers);
    }
    catch(error){
        console.log("Error in Suggesting Subscriber:",error.message);
        res.status(500).json({error:error.message});
    }
};
const updateUser = async(req,res) => {
    const{fullName, email, username, currentPassword, newPassword, bio, link }=req.body;
    let{userImage, bgImage}=req.body;
    const userId = req.user._id;
    try{
        let user = await Subscriber.findById(userId);
        if(!user) return res.status(404).json({message: "Subscriber not found"});

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error:"please provide both current and new password"});
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error:"Current password is incorrect"});
            if(newPassword.length<8){
                return res.status(400).json({error:"Password must be of atleast 8 digits"})
            }
        }
        if(userImage){
            if(user.userImage){
                await cloudinary.uploader.destroy(user.userImage.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(userImage);
            userImage = uploadedResponse.secure_url;
        }
        if(bgImage){
            if(user.bgImage){
                await cloudinary.uploader.destroy(user.bgImage.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(bgImage);
            bgImage = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email= email || user.email;
        user.userImage= userImage || user.userImage;
        user.bgImage = bgImage || user.bgImage;
        user.username= username || user.username;
        user.bio =bio || user.bio;
        user.link =link || user.link;

        user= await user.save();
        user.password= null;
        return res.status(200).json(user);
    }
    catch(error){
        console.log("Error in updating Subscriber Profile", error.message);
        res.status(500).json({error:error.message});
    }
};
const router = express.Router();
router.get("/profile/:username", Encrypted, getProfile);
router.get("/suggested", Encrypted, suggestUsers);
router.post("/follow/:id", Encrypted, followUnfollowUser);
router.post("/update", Encrypted, updateUser);
export default router;