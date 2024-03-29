import bcryptjs from "bcryptjs";
import User from "../models/user.js";
import { errorHandler } from "../utils/error.js";
import Listing from "../models/listing.js";

// Define a function to update user information
export const updateUser = async (req, res, next) => {
  // Check if the user is trying to update their own account
  if (req.user.id !== req.params.id) {
    // Return an error message
    return next(errorHandler(403, "You can only update your own account!"));
  }

  try {
    // Hash the password if provided in the request
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Update the user's information in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    // Extract the password field from the updated user document
    const { password, ...rest } = updatedUser._doc;

    // Respond with the updated user information (excluding the password)
    res.status(200).json(rest);
  } catch (error) {
    // Handle any errors that occur during the update process
    next(error);
  }
};

// Define an asynchronous function to delete a user
export const deleteUser = async (req, res, next) => {
  // Check if the user making the request matches the user being deleted
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can only delete your own account!"));
  }

  try {
    // Attempt to delete the user by their ID
    await User.findByIdAndDelete(req.params.id);

    // Clear the access token cookie and send a success response
    res.clearCookie("access_token").status(200).json("User has been deleted!");
  } catch (error) {
    // Handle any errors that occur during the deletion process
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only access your own listings"));

  try {
    const listing = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "The requested user not found!"));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
