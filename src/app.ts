import express, { Application } from "express";

const app: Application = express();

// Middleware
app.use(express.json());

export default app;
