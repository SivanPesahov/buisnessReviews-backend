import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  content: string;
  business: Types.ObjectId;
  user: Types.ObjectId;
  likes: Types.ObjectId[];
  stars: number;
}

const reviewSchema = new Schema<IReview>({
  content: {
    type: String,
    required: true,
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
    required: true,
  },
});

const Review = model<IReview>("Review", reviewSchema);

export default Review;
