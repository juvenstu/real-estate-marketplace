import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import listingRouter from "./routes/listing.js";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

// Connect to the MongoDB database
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log("Connected to the database."))
  .catch((error) => console.log(error));

// Create an Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The server is running on port ${PORT}.`));

// Create routes for user-related functionality
app.use("/api/user", userRouter);

// Create routes for authentication-related functionality
app.use("/api/auth", authRouter);

// Create routes for listing
app.use("/api/listing/", listingRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
