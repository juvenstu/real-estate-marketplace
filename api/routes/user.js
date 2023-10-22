import express from "express";
import {
  deleteUser,
  getUser,
  getUserListings,
  updateUser,
} from "../controllers/user.js";
import { verifyToken } from "../utils/verifyUser.js";

// Create an Express router
const router = express.Router();

// Define a POST route for updating and deleting user with middleware for token verification
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/:id", verifyToken, getUser);

// Export the router for use in other parts of the application
export default router;
