import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const limit = "50mb";


app.use(cors({
    origin : process.env.CORS_ORIGIN,
}));
app.use(express.json({limit}));
app.use(express.urlencoded({extended: true, limit}));
app.use(express.static("public"));
app.use(cookieParser({}));




// route portion
import userRoutes from "./routes/user/registration.routes.js";
// import memberRoutes from "./routes/member.routes.js";

import { errorHandler } from "./middlewares/errorHandler.js";



app.use("/api/v1/user", userRoutes);
// app.use("/api/v1/member", memberRoutes);






app.use(errorHandler)

export default app;