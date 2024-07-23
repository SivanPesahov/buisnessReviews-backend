import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import businessRoutes from "./routes/BusinessRoutes";
import reviewRoutes from "./routes/ReviewRoutes";
import authRoutes from "./routes/AuthRoutes";
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
export const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

dotenv.config();

async function main() {
  await connectDB();

  app.use(express.static("public"));
  app.use(express.json());
  app.use(cors());

  app.use("/api/Business", businessRoutes);
  app.use("/api/Reviews", reviewRoutes);
  app.use("/api/Auth", authRoutes);

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  // Socket.IO connection handler
  io.on("connection", (socket: any) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

main().catch((err) => console.error(err));
