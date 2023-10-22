import mongoose from "mongoose";

// Define a user schema using Mongoose.Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Username is required
      unique: true, // Username must be unique
    },
    email: {
      type: String,
      required: true, // Email is required
      unique: true, // Email must be unique
    },
    password: {
      type: String,
      required: true, // Password is required
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      required: true,
    },
  },
  { timestamps: true } // Enable timestamps for createdAt and updatedAt fields
);

// Create a User model based on the userSchema
const User = mongoose.model("User", userSchema);

// Export the User model to be used elsewhere in your application
export default User;
