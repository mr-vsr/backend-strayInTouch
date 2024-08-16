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

import userRouter from "./routes/user.routes.js"
// import ngoRouter from "./routes/ngo.routes.js"
// import reportRouter from "./routes/report.routes.js"
// import aidingRouter from "./routes/aiding.routes.js"
// import healthCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/user", userRouter);
// app.use("/api/v1/ngo", ngoRouter);
// app.use("/api/v1/report", reportRouter);
// app.use("/api/v1/aiding", aidingRouter);
// app.use("/api/v1/healthCheck", healthCheckRouter);

export { app };