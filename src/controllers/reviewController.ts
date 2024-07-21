import { Request, Response } from "express";
import Review from "../models/Review-model";
import { IReview } from "../models/Review-model";
import { ILike } from "../models/Like-model";
import Like from "../models/Like-model";
import { Types } from "mongoose";

interface RequestWithUserId extends Request {
  userId?: string | null;
}

async function getReviewsByBuisnessId(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const reviews = await Review.find({ business: id });
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function addReview(req: RequestWithUserId, res: Response) {
  const reviewToAdd: Partial<IReview> = req.body;
  const userId = req.userId;
  console.log(userId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const newReview = new Review({ ...reviewToAdd, user: userId });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err: any) {
    console.error("Error while creating review", err);

    if (err.name === "ValidationError") {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Server error while creating review" });
    }
  }
}

async function deleteReview(req: RequestWithUserId, res: Response) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const reviewToDelete = await Review.findOneAndDelete({
      _id: id,
      user: userId,
    });
    if (!reviewToDelete) {
      return res.status(404).json({ message: "review not found" });
    }

    if (reviewToDelete.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this review" });
    }

    res.json({ message: "review deleted" });
  } catch (err: any) {
    console.log(
      `review.controller, deleteReview. Error while deleting review with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while deleting review" });
  }
}

async function editReview(req: RequestWithUserId, res: Response) {
  const { id } = req.params;
  const userId = req.userId;

  const { content, stars } = req.body;

  try {
    const updatedReview = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      { content, stars },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      console.log(
        `review.controller, updateReview. review not found with id: ${id}`
      );
      return res.status(404).json({ message: "review not found" });
    }

    if (updatedReview.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this review" });
    }

    res.json(updatedReview);
  } catch (err: any) {
    console.log(
      `review.controller, updateReview. Error while updating review with id: ${id}`,
      err
    );

    if (err.name === "ValidationError") {
      // Mongoose validation error
      console.log(`review.controller, updateReview. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      // Other types of errors
      console.log(`review.controller, updateReview. ${err.message}`);
      res.status(500).json({ message: "Server error while updating review" });
    }
  }
}

async function likeReview(
  req: RequestWithUserId,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  const newLike: Partial<ILike> = {
    review: new Types.ObjectId(id),
    user: new Types.ObjectId(userId),
  };

  const existingLike = await Like.findOne({ review: id, user: userId });
  if (existingLike) {
    res.status(400).json({ error: "User has already liked this review" });
    return;
  }

  try {
    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const like = new Like(newLike);
    await like.save();

    review.likes.push(like._id);
    await review.save();

    res.status(201).json(like);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An error occurred while liking the review" });
  }
}
async function unLikeReview(
  req: RequestWithUserId,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const selectedReview = await Review.findById(id).populate("likes");

    if (!selectedReview) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const likeToRemove = await Like.findOne({ review: id, user: userId });

    if (!likeToRemove) {
      res.status(404).json({ error: "Like not found" });
      return;
    }

    selectedReview.likes = selectedReview.likes.filter(
      (like) => like._id.toString() !== likeToRemove._id.toString()
    );

    await selectedReview.save();
    await Like.deleteOne({ _id: likeToRemove._id });

    res
      .status(200)
      .json({ message: "Like removed successfully", review: selectedReview });
  } catch (error: any) {
    console.error("Error while removing like from review:", error);
    res
      .status(500)
      .json({ error: "Server error while removing like from review" });
  }
}

export {
  getReviewsByBuisnessId,
  addReview,
  deleteReview,
  editReview,
  likeReview,
  unLikeReview,
};
