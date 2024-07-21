import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db";
import Business from "./models/Business-model";
import User, { IUser } from "./models/User-model";
import Like from "./models/Like-model";
import Review from "./models/Review-model";

const SALT_ROUNDS = 10; // Number of rounds to generate salt. 10 is recommended value

dotenv.config(); // Load environment variables

const users = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
  },
  {
    username: "jane_doe",
    email: "jane@example.com",
    password: "password456",
    firstName: "Jane",
    lastName: "Doe",
  },
];

const businesses = [
  {
    name: "Tech Solutions",
    description: "A leading tech company specializing in software development.",
  },
  {
    name: "Healthy Eats",
    description:
      "A restaurant chain offering healthy and organic food options.",
  },
];

const reviews = [
  {
    content: "Great service and friendly staff.",
  },
  {
    content: "The food was delicious and fresh.",
  },
];

const likes: any[] = [];

async function seedDB() {
  try {
    await connectDB(); // Connect to the database
    await Business.deleteMany({});
    await User.deleteMany({});
    await Like.deleteMany({});
    await Review.deleteMany({});

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS); // Hash password
        const user = new User({ ...u, password: hashedPassword }); // Create new user object
        await user.save(); // Save user to database
        return user; // Return the saved user object
      })
    );

    // Create businesses
    const createdBusinesses = await Business.insertMany(businesses);

    // Create reviews and assign them to users and businesses
    const createdReviews = await Promise.all(
      reviews.map(async (r, index) => {
        const review = new Review({
          ...r,
          user: createdUsers[index % createdUsers.length]._id,
          business: createdBusinesses[index % createdBusinesses.length]._id,
        });
        await review.save();
        return review;
      })
    );

    // Create likes and assign them to users and reviews
    const createdLikes = await Promise.all(
      createdReviews.map(async (review) => {
        const like = new Like({
          review: review._id,
          user: createdUsers[0]._id, // Assuming first user likes all reviews
        });
        await like.save();
        await Review.findByIdAndUpdate(
          review._id,
          { $push: { likes: like._id } },
          { new: true, useFindAndModify: false }
        );
        return like;
      })
    );

    console.log("Database seeded");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close(); // Close the database connection
  }
}

seedDB();
