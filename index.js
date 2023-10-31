import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongo.js";
import dotenv from 'dotenv'
dotenv.config()
import userRouter from './routes/users.js'
import adminRouter from "./routes/admin.js";



const app = express();


app.use(cors({
  origin: 'http://localhost:3000', // Update this to the origin of your frontend application
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());



app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use(express.static("public"));

const port = 5000;

connectDB()




app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});