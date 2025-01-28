import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN_LOCALHOST,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import ngoRouter from "./routes/ngo.routes.js";
import reportRouter from "./routes/report.routes.js";
import aidingRouter from "./routes/aid.routes.js";
import adminRouter from "./routes/admin.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
// import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/ngo", ngoRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/aiding", aidingRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/health-check", healthCheckRouter);
// app.use("/api/v1/auth", authRouter);

export { app };