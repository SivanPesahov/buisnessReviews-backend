// src/routes/BusinessRoutes.ts

import { Router } from "express";
import {
  getBusiness,
  getBusinessById,
} from "../controllers/buisnessController";

const router = Router();

// Define your routes
router.get("/businesses", getBusiness);
router.get("/:id", getBusinessById);

export default router;
