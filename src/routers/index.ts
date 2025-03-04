import express from "express";
import { getAllUsers, getSingleUser, Login, postUser } from "../controllers/User";
import { chatHistory, createChat, sendMessage,receivedMessages,getUserMessages, getNotifications } from "../controllers/Chats";

const routes = express.Router();
//users
routes.post("/register", postUser)
routes.get("/users", getAllUsers)
routes.get("/:id/user", getSingleUser)
routes.post("/login", Login)

//chats
routes.post("/create", createChat)
routes.post("/sendmessage", sendMessage)
routes.get("/chathistory", chatHistory)
routes.get("/newmessages", receivedMessages)
routes.get("/notification", getNotifications)
routes.get("/usermessages", getUserMessages)
export default routes;
