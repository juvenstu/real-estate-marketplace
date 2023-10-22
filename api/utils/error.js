// Define an error handling utility function
export const errorHandler = (statusCode, message) => {
  // Create a new Error object
  const error = new Error();

  // Set the HTTP status code for the error
  error.statusCode = statusCode;

  // Set the error message
  error.message = message;

  // Return the error object
  return error;
};
