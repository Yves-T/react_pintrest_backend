import express, { Express, Request, Response } from "express";
import router from "./routes";
import connectDB from "./util/connectDB";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use("/", router());

app.listen(port, () => {
  connectDB();
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
