import express from "express";
import {
  createListing,
  deleteListing,
  getListing,
  getListings,
  updateListing,
} from "../controllers/listing.js";
import { verifyToken } from "../utils/verifyUser.js";

// Create an Express Router
const router = express.Router();

// Define a POST route for creating a new listing
router.post("/create", verifyToken, createListing);

// Define a route for getting the listing by its id
router.get("/get/:id", getListing);

// Define a route for deleting a listing
router.delete("/delete/:id", verifyToken, deleteListing);

// Define a route for updating an existing listing
router.put("/update/:id", verifyToken, updateListing);
router.get("/get", getListings);

// Export the router so it can be used in the main application
export default router;
