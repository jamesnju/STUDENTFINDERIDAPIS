import express from "express"
import logger from './middleware/logger';
import routes from "./routers/index";
import errorHandler from "./middleware/error";
import dotenv from "dotenv"
import cors from 'cors';
import path from 'path';  // Add this import for path
import { mpesaWebhook } from "./controllers/payments";




const app = express();
const PORT = 8000;

dotenv.config()
app.use(cors());  // Enable CORS for all routes
// body parser to allow submit json data
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//logger middleware
app.use(logger);

app.post('/api/v1/mpesaWebhook', mpesaWebhook);


//routes
app.use("/api/v1", routes);

app.use(errorHandler);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app
