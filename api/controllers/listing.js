import Listing from "../models/listing.js";
import { errorHandler } from "../utils/error.js";

// Create a new listing
export const createListing = async (req, res, next) => {
  // Verify whether the user ID from the cookie matches the one provided
  if (req.user.id !== req.body.userRef)
    return next(
      errorHandler(
        403,
        "Creating a listing is restricted to accounts that you own."
      )
    );
  try {
    // Attempt to create a new listing using the data from the request body
    const listing = await Listing.create(req.body);

    // If the listing is successfully created, respond with a 201 status code and the listing data
    res.status(201).json(listing);
  } catch (error) {
    // If an error occurs during the creation process, pass the error to the next middleware
    next(error);
  }
};

// Get the created listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return next(
        errorHandler(404, "The requested listing could not be found.")
      );
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

// Delete a listing
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing)
    return next(errorHandler(404, "The requested listing could not be found."));

  if (req.user.id !== listing.userRef)
    return next(
      handleError(
        403,
        "Deletion of a listing is restricted to the owner only. You may only delete your own listings."
      )
    );

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("The listing has been deleted successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing)
    return next(errorHandler(404, "The requested listing could not be found."));
  if (req.user.id !== listing.userRef)
    return next(
      handleError(
        403,
        "Modification of a listing is restricted to the owner only. You may only update your own listings."
      )
    );

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const {
      limit = 9,
      startIndex = 0,
      offer,
      furnished,
      parking,
      type,
      searchTerm = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const parseBooleanQueryParam = (param) =>
      param === undefined || param === "false" ? { $in: [true, false] } : param;

    const offerQuery = parseBooleanQueryParam(offer);
    const furnishedQuery = parseBooleanQueryParam(furnished);
    const parkingQuery = parseBooleanQueryParam(parking);
    const typeQuery =
      type === undefined || type === "all" ? { $in: ["sale", "rent"] } : type;

    const listing = await Listing.find({
      title: { $regex: searchTerm, $options: "i" },
      offer: offerQuery,
      furnished: furnishedQuery,
      parking: parkingQuery,
      type: typeQuery,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};
