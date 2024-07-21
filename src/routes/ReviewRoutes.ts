import { Router } from "express";
import {
  getReviewsByBuisnessId,
  addReview,
  deleteReview,
  editReview,
  likeReview,
  unLikeReview,
} from "../controllers/reviewController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Define your routes
router.get("/:id", getReviewsByBuisnessId);
router.post("/create", verifyToken, addReview);
router.delete("/:id", verifyToken, deleteReview);
router.patch("/:id", verifyToken, editReview);
router.patch("/like/:id", verifyToken, likeReview);
router.patch("/unLike/:id", verifyToken, unLikeReview);

export default router;
