import jwt from "jsonwebtoken";
import Subscriber from "./Models/userConfig.js";
export const Encrypted = async(req, res, next) => {
    try{
        const token= req.cookies.jwt;
        const decrypted = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Subscriber.findById(decrypted.userId).select("-password");
        if(!token){
            return res.status(401).json({error:"Unauthorized: No Token Provided"});
        }
        if(!decrypted){
            return res.status(401).json({error:"Unauthorized: Invalid Token"});
        }
        if(!user){
            return res.status(404).json({error:"Subscriber Not Found."});
        }
        req.user = user;
        next();
    }
    catch(error){
        console.log("Error in Encrypted server.", error.message);
        return res.status(500).json({error:"Internal Server Error"});
    }
};