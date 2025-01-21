import express from "express";
import {setLoginToken} from "./createkey.js";
import {Encrypted} from "./Secure.js";
import bcrypt from "bcryptjs";
import Subscriber from "./Models/userConfig.js";
const signup = async (req,res) =>{
    try{
        const { fullName , username, email, password }= req.body;
        const correctEmail = /^[^\s@]+@[^\s@]+$/;
        if(!correctEmail.test(email)){
            return res.status(400).json({ error: "Wrong Email Type."});
        }
        const existingSubscriber = await Subscriber.findOne({username});
        if(existingSubscriber){
            return res.status(400).json({ error:"Username is already in use."});
        }
        if(password.length<8){
            return res.status(400).json({ error: "Password must be atleast of 8 digits"});
        }
        const Password= await Subscriber.findOne({password});
        if(Password){
            return res.status(400).json({error: "Password is already taken"});
        }
        const existingEmail = await Subscriber.findOne({email});
        if(existingEmail){
            return res.status(400).json({ error:"Email is already in use."});
        }
        const newUser =new Subscriber({
            fullName,
            username,
            email,
            password,
        });
        if(newUser){
            setLoginToken(newUser._id,res);
            await newUser.save();
            
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                userName:newUser.userName,
                email: newUser.email,
                followers: newUser.followers,
                following:newUser.following,
                userImage:newUser.userImage,
                bgImage:newUser.bgImage,
            });
        }
        else{
            res.status(400).json({error:"Invalid user Data"});
        }
    }
    catch(error){
        console.log("Error in signup.", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
const findUser= async(req,res) =>{
    try{
        const user= await Subscriber.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }
    catch (error){
        console.log("Error in finding Subscriber.", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
const logout= async(req,res) =>{
    try{
        res.cookie("jwt", "",{maxAge:0});
        res.status(200).json({message:"Logged Out done"});
    }
    catch (error){
        console.log("Error in logging out.", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
const login = async(req,res) => {
    try{
        const {username,password}=req.body;
        const user=await Subscriber.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password,user?.password || "");
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid username or password"});
        }
        setLoginToken(user._id,res);
        res.status(201).json({
            _id:user._id,
            username:user.username,
            following:user.following,
            email: user.email,
            userImage:user.userImage,
            followers: user.followers,
            bgImage:user.bgImage,
            fullName:user.fullName,
        });
    }
    catch (error){
        console.log("Error in logging in.", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};
const router =express.Router();
router.post("/signup", signup);
router.get("/me",Encrypted, findUser);
router.post("/logout", logout);
router.post("/login", login);
export default router;
