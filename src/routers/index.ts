import express from "express";
import { deleteUser, getAllUsers, getSingleUser, Login, postUser, updateUser } from "../controllers/User";
import { chatHistory, createChat, sendMessage,receivedMessages,getUserMessages, getNotifications } from "../controllers/Chats";
import upload from "../utils/upload";
import { deleteLostID, getAllLostIDs, getLostID, postLostID, updateLostID } from "../controllers/ReportLostId";
import { deleteFoundID, getAllFoundIDs, getFoundID, postFoundID, updateFoundID } from "../controllers/ReportFoundIds";
import { deleteReportedFoundIDs, getAllReportedFoundIDs } from "../controllers/ReportedFoundIds";
import { deleteReportedLostIDs, getAllReportedLostIDs } from "../controllers/ReportedLostIds";
import { getAllPayments, mpesaWebhook, payMpesa } from "../controllers/payments";

const routes = express.Router();
//users
routes.post("/register", postUser)
routes.get("/users", getAllUsers)
routes.get("/:id/user", getSingleUser)
routes.post("/login", Login);
routes.patch("/:id/user", updateUser);
routes.delete("/:id/user", deleteUser);

//payements
routes.get("/payments", getAllPayments)
routes.post("/mpesa", payMpesa);
// routes.post("/webhook", mpesaWebhook);


//chats
routes.post("/create", createChat);
routes.post("/sendmessage", sendMessage);
routes.get("/chathistory", chatHistory);
routes.get("/newmessages", receivedMessages)
routes.get("/notification", getNotifications)
routes.get("/usermessages", getUserMessages)

//lostid
routes.post('/lostID', upload.single('image'), postLostID);
routes.patch('/lostID/:id', upload.single('image'), updateLostID);
routes.get('/:id/lostID', getLostID);
routes.get('/lostIDs', getAllLostIDs);
routes.delete('/lostID/:id', deleteLostID);

//foundid
routes.post('/foundID', upload.single('image'), postFoundID);
routes.patch('/foundID/:id', upload.single('image'), updateFoundID);
routes.get('/:id/foundID', getFoundID);
routes.get('/foundIDs', getAllFoundIDs);
routes.delete('/foundID/:id', deleteFoundID);

//reportedfoundID
routes.get('/foundIDs', getAllReportedFoundIDs);
routes.delete('/foundID/:id', deleteReportedFoundIDs);

//reportedLostID
routes.get('/lostIDs', getAllReportedLostIDs);
routes.delete('/lostID/:id', deleteReportedLostIDs);



export default routes;
