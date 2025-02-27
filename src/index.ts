import express, { NextFunction, Request, Response } from "express"
import logger from './middleware/logger';
import routes from "./routers/index";
import errorHandler from "./middleware/error";
import dotenv from "dotenv"
import cors from 'cors';
//import { stripeWebhook } from "./controllers/webhook";
// import { mpesaWebhook } from "./controllers/mpesa";



const app = express();
const PORT = 8000;

dotenv.config()
app.use(cors());  // Enable CORS for all routes

//logger middleware
app.use(logger);
// 🛑 Important: Raw body middleware for Stripe Webhooks
//app.post("/api/v1/verifystripewebhk", express.raw({ type: "application/json" }), stripeWebhook);
//app.post("/api/v1/mpesaWebhook", express.raw({ type: "application/json" }), mpesaWebhook);

// body parser to allow submit json data
app.use(express.json());

//routes
app.use("/api/v1", routes);

app.use(errorHandler);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app
