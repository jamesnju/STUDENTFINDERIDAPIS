import express from "express";
import { getAllUsers, getSingleUser, Login, postUser } from "../controllers/User";
import { chatHistory, createChat, sendMessage } from "../controllers/Chats";

const routes = express.Router();
//users
routes.post("/register", postUser)
routes.get("/users", getAllUsers)
routes.get("/:id/user", getSingleUser)
routes.post("/login", Login)

//chats
routes.post("/create", createChat)
routes.post("/sendmessage", sendMessage)
routes.get("/getall", chatHistory)
export default routes;
