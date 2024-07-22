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
  {
    username: "bob_smith",
    email: "bob@example.com",
    password: "password789",
    firstName: "Bob",
    lastName: "Smith",
  },
  {
    username: "alice_jones",
    email: "alice@example.com",
    password: "password101",
    firstName: "Alice",
    lastName: "Jones",
  },
  {
    username: "charlie_brown",
    email: "charlie@example.com",
    password: "password102",
    firstName: "Charlie",
    lastName: "Brown",
  },
  {
    username: "david_lee",
    email: "david@example.com",
    password: "password103",
    firstName: "David",
    lastName: "Lee",
  },
  {
    username: "emily_clark",
    email: "emily@example.com",
    password: "password104",
    firstName: "Emily",
    lastName: "Clark",
  },
  {
    username: "frank_wright",
    email: "frank@example.com",
    password: "password105",
    firstName: "Frank",
    lastName: "Wright",
  },
  {
    username: "grace_hall",
    email: "grace@example.com",
    password: "password106",
    firstName: "Grace",
    lastName: "Hall",
  },
  {
    username: "henry_adams",
    email: "henry@example.com",
    password: "password107",
    firstName: "Henry",
    lastName: "Adams",
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
  {
    name: "Auto Repair Pro",
    description: "Professional car repair and maintenance services.",
  },
  {
    name: "Book Haven",
    description: "A cozy bookstore with a wide selection of books.",
  },
  {
    name: "Fitness World",
    description: "A state-of-the-art gym and fitness center.",
  },
];

const reviews = [
  {
    content: "Great service and friendly staff.",
    stars: 5,
  },
  {
    content: "The food was delicious and fresh.",
    stars: 4,
  },
  {
    content: "Quick and reliable service.",
    stars: 5,
  },
  {
    content: "A fantastic place for book lovers.",
    stars: 5,
  },
  {
    content: "Excellent facilities and trainers.",
    stars: 5,
  },
  {
    content: "Amazing experience, highly recommend.",
    stars: 4,
  },
  {
    content: "Healthy and tasty meals.",
    stars: 5,
  },
  {
    content: "Very professional and helpful staff.",
    stars: 4,
  },
  {
    content: "A peaceful place to read.",
    stars: 5,
  },
  {
    content: "Great equipment and atmosphere.",
    stars: 4,
  },
];

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
