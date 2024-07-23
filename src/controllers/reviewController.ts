import { Request, Response } from "express";
import Review from "../models/Review-model";
import { IReview } from "../models/Review-model";
import { ILike } from "../models/Like-model";
import Like from "../models/Like-model";
import { Types } from "mongoose";
import Business from "../models/Business-model";
import { IBusiness } from "../models/Business-model";
import { io } from "..";
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

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const businessToFind = await Business.findById(reviewToAdd.business);
  if (!businessToFind) {
    res.status(404).json({ message: "Business not found" });
    return;
  }

  try {
    const newReview = new Review({ ...reviewToAdd, user: userId });
    const savedReview = await newReview.save();
    businessToFind.stars.push(reviewToAdd.stars as number);
    await businessToFind.save();
    io.emit("reviewCreated", savedReview);
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
    const reviewToDelete = await Review.findOne({ _id: id });
    if (!reviewToDelete) {
      return res.status(404).json({ message: "review not found" });
    }

    if (reviewToDelete.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this review" });
    }

    const businessToFind = await Business.findById(reviewToDelete.business);
    if (!businessToFind) {
      res.status(404).json({ message: "Business not found" });
      return;
    }

    const starIndex = businessToFind.stars.indexOf(reviewToDelete.stars);
    if (starIndex !== -1) {
      businessToFind.stars.splice(starIndex, 1);
    }
    await businessToFind.save();
    await reviewToDelete.deleteOne();
    io.emit("reviewDeleted", id);

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
    const updatedReview = await Review.findOne({ _id: id, user: userId });

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

    const businessToUpdate = await Business.findById(updatedReview.business);
    if (!businessToUpdate) {
      res.status(404).json({ message: "Business not found" });
      return;
    }

    const index = businessToUpdate.stars.indexOf(updatedReview.stars);
    if (index !== -1) {
      businessToUpdate.stars[index] = stars;
    } else {
      businessToUpdate.stars.push(stars);
    }

    await businessToUpdate.save();

    updatedReview.content = content;
    updatedReview.stars = stars;
    const review = await updatedReview.save();
    io.emit("reviewEdited", review);

    res.json(review);
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

    review.likes.push(like.user);
    await review.save();
    io.emit("reviewLiked", review);

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
    io.emit("reviewUnLiked", selectedReview);

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
