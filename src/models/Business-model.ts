import { Schema, model, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  description: string;
  stars: [Number];
}

const businessSchema = new Schema<IBusiness>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  stars: [
    {
      type: Number,
      min: 1,
      max: 5,
    },
  ],
});

const Business = model<IBusiness>("Business", businessSchema);

export default Business;
