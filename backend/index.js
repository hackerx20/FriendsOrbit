import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import authorize from "./authorization.js";
import appNotification from "./notification.js";
import Userpost from "./post.js";
import Userdata from "./user.js";

import connectMongoDB from "./MongoDataBase.js";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const Port = process.env.PORT || 5000;
const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname,"/frontend/public")));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authorize);
app.use("/api/users", Userdata);
app.use("/api/posts", Userpost);
app.use("/api/notifications", appNotification);
// In your backend/index.js, add this to serve frontend build
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}
app.listen(Port, () => {
    console.log(`server is running on port ${Port}`);
    connectMongoDB();
});
