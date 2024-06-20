import express from "express";
import {Encrypted} from "./Secure.js";
import Popup from "./Models/notificationStructure.js";
const deletePopup = async (req,res) => {
    try{
        const userId = req.user._id;
        await Popup.deleteMany({to: userId});
        res.status(200).json({message:"Notifications deleted successfully"});

    }
    catch(error){
        console.log("Error in deletePopup function", error.message);
        res.status(500).json({error:"Internal server Error"});
    }
};
const getPopup = async (req,res) => {
    try{
        const userId = req.user._id;
        const notifications = await Popup.find({to: userId}).populate({
            path:"from",
            select: "username userImage",
        });
        await Popup.updateMany({to: userId},{read:true});
        res.status(200).json(notifications);
    }
    catch(error){
        console.log("Error in getPopup function", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
const router = express.Router();
router.get("/", Encrypted, getPopup);
router.delete("/", Encrypted, deletePopup);

export default router;