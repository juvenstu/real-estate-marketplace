import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// Function for user registration (signup)
export const signup = async (req, res, next) => {
  // Extract user registration data from the request body
  const { username, email, password } = req.body;

  // Hash the user's password for security
  const hashedPassword = bcryptjs.hashSync(password, 10);

  // Create a new User instance with the hashed password
  const newUser = User({ username, email, password: hashedPassword });

  try {
    // Save the new user to the database
    await newUser.save();

    // Respond with a success message
    res.status(201).json("User created successfully");
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

// Function for user authentication (signin)
export const signin = async (req, res, next) => {
  // Extract user login data from the request body
  const { email, password } = req.body;

  try {
    // Find a user with the provided email in the database
    const validUser = await User.findOne({ email });

    // If the user is not found, return a "User not found" error
    if (!validUser) return next(errorHandler(404, "User not found!"));

    // Compare the provided password with the hashed password in the database
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    // If the password is invalid, return an "Invalid password" error
    if (!validPassword) return next(errorHandler(404, "Invalid password!"));

    // Generate a JSON Web Token (JWT) for user authentication
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    // Exclude the password field from the user data
    const { password: pass, ...rest } = validUser._doc;

    // Set the JWT token as an HTTP-only cookie for client-side authentication
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

// Function for user authentication (Continue with Google)
export const google = async (req, res, next) => {
  const { name, email, avatar } = req.body;
  try {
    const user = await User.findOne({ email });

    // Sign in the user if already exists
    if (user) {
      // Generate a JSON Web Token (JWT) for user authentication
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      // Exclude the password field from the user data
      const { password: pass, ...rest } = user._doc;

      // Set the JWT token as an HTTP-only cookie for client-side authentication
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      // Generate a random password for the user
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      // Hash the user's password for security
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      // Generate a username from "name"
      const username =
        name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4);

      // Create a new User instance with the generated hashed password and avatar
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        avatar,
      });

      await newUser.save();
      // Generate a JSON Web Token (JWT) for user authentication
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      // Exclude the password field from the user data
      const { password: pass, ...rest } = newUser._doc;

      // Set the JWT token as an HTTP-only cookie for client-side authentication
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

// Function to handle user sign out
export const signout = (req, res, next) => {
  try {
    // Clear the 'access_token' cookie to log the user out
    res.clearCookie("access_token");

    // Respond with a status code of 200 and a JSON message indicating successful sign-out
    res.status(200).json({ message: "User has been logged out" });
  } catch (error) {
    // If an error occurs during sign-out, pass it to the next middleware for error handling
    next(error);
  }
};
