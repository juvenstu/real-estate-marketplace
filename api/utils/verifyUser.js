import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  // Retrieve the JWT token from the 'access_token' cookie
  const token = req.cookies.access_token;

  // Check if the token exists
  if (!token) {
    // If no token is found, return an Unauthorized error
    return next(errorHandler(401, "Unauthorized"));
  }

  // Verify the token using the JWT secret
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      // If token verification fails, return a Forbidden error
      return next(errorHandler(403, "Forbidden"));
    }

    // If the token is valid, attach the user data to the request object
    req.user = user;

    // Continue to the next middleware or route
    next();
  });
};
