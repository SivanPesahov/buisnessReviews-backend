// src/routes/BusinessRoutes.ts

import { Router } from "express";
import getBusiness from "../controllers/buisnessController";

const router = Router();

// Define your routes
router.get("/businesses", getBusiness);

export default router;
