import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";

// Define the Profile component
export default function Profile() {
  // Retrieve the current user, loading status, and error from Redux state
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // Initialize Redux dispatcher
  const dispatch = useDispatch();

  // File-related state variables
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({});

  // State to track update success
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // States for user listings
  const [userListing, setUserListing] = useState({});
  const [showListingError, setShowListingError] = useState(false);

  // Handle file upload when 'file' state changes
  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  // Function to handle file upload
  const handleFileUpload = (file) => {
    const storage = getStorage(app);

    // Generate a unique file name for the uploaded image
    const fileName =
      new Date().getTime() + file.name.replaceAll(" ", "").toLowerCase();
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor the upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(Math.round(progress));
      },
      () => setFileUploadError(true),
      () => {
        // When the upload is complete, get the download URL and update the form data
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData((prevData) => ({ ...prevData, avatar: downloadURL }))
        );
      }
    );
  };

  // Handle form input changes
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      // Send a POST request to update user data
      const result = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await result.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  // Function to handle user account deletion
  const handleDeleteUser = async () => {
    try {
      // Dispatch a Redux action to indicate the start of the user deletion process
      dispatch(deleteUserStart());

      // Send a DELETE request to the server to delete the user's account
      const response = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      // Parse the response data as JSON
      const data = await response.json();

      if (data.success === false) {
        // If the server indicates a failure, dispatch a failure action
        dispatch(deleteUserFailure(data.message));
        return;
      }

      // If the user deletion is successful, dispatch a success action
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      // Handle errors that may occur during the process and dispatch a failure action
      dispatch(deleteUserFailure(error.message));
    }
  };

  // Function to handle user sign-out
  const handleSignOut = async () => {
    try {
      // Dispatch a Redux action to indicate the start of the sign-out process
      dispatch(signOutUserStart());

      // Send a request to the server to sign the user out
      const response = await fetch("/api/auth/signout");

      // Parse the response data as JSON
      const data = await response.json();

      if (!data.success) {
        // If the server indicates a failure, dispatch a failure action with an error message
        dispatch(signOutUserFailure(data.message));
        return;
      }

      // If the sign-out is successful, dispatch a success action
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      // Handle errors that may occur during the process and dispatch a failure action with an error message
      dispatch(signOutUserFailure(error.message));
    }
  };

  // Function to handle show listing
  const handleShowListing = async () => {
    try {
      setShowListingError(false);
      const response = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await response.json();
      if (data.success === false) {
        setShowListingError(true);
        return;
      }
      setUserListing(data);
      setShowListingError(false);
    } catch (error) {
      setShowListingError(true);
    }
  };

  // Function for handling the listing deletion
  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListing((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  // Render the profile form
  return (
    <div className="p-7 rounded-lg my-5 max-w-lg mx-auto bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input for selecting an avatar image */}
        <input
          type="file"
          name="avatar"
          id="avatar"
          accept="image/*"
          ref={fileRef}
          onChange={(e) => setFile(e.target.files[0])}
          hidden
        />
        {/* Display the current avatar and allow user to trigger file selection */}
        <img
          src={formData.avatar || currentUser.avatar}
          alt="Profile"
          onClick={() => fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            // Display an error message if the upload fails
            <span className="text-red-700">
              Image Upload Error: The image must be less than 2 MB.
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            // Display upload progress
            <span className="text-slate-700">{`Image Upload Progress: ${filePercentage}%`}</span>
          ) : (
            filePercentage === 100 && (
              // Display success message when the upload is complete
              <span className="text-green-700">
                Image successfully uploaded.
              </span>
            )
          )}
        </p>
        {/* Input fields for updating username, email, and password */}
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        {/* Button for submitting the form */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>
      {/* Link to create listing page */}
      <Link
        to="/create-listing"
        className="bg-green-700 block mt-4 text-white text-center p-3 rounded-lg uppercase hover:opacity-95"
      >
        Create listing
      </Link>
      {error && (
        // Display an error message when there's an error
        <div className="p-2 bg-red-100 text-red-800 rounded-lg mt-5 text-center text-sm">
          Error: {error}
        </div>
      )}
      {updateSuccess && (
        // Display a success message when the update is successful
        <div className="p-2 bg-green-100 text-green-800 rounded-lg mt-5 text-center text-sm">
          The user has been updated successfully.
        </div>
      )}
      {/* Show listing section */}
      <button
        onClick={handleShowListing}
        className="text-green-700 border uppercase hover:bg-green-100 border-green-700 p-3 rounded-lg w-full mt-4"
      >
        Show Listing
      </button>
      {showListingError && (
        <p className="text-red-700 text-sm text-center mt-4">
          An error occurred while attempting to display the listing. We
          apologize for any inconvenience. Please kindly retry your request
        </p>
      )}
      {userListing?.length > 0 ? (
        <div className="mt-7">
          <hr />
          <h1 className="text-3xl text-center my-4 uppercase font-thin w-full">
            Your Listing
          </h1>
          {userListing?.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg w-full flex items-center p-3"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageURLs[0]}
                  alt="Listing Cover"
                  className="h-20 w-40 rounded-lg object-cover"
                />
              </Link>
              <div className="p-3">
                <Link
                  to={`/listing/${listing._id}`}
                  className="text-slate-700 font-semibold truncate"
                >
                  {listing.title}
                </Link>
                <div className="flex gap-3 mt-2">
                  <Link
                    to={`/update-listing/${listing._id}`}
                    className="text-green-700 font-semibold text-sm rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className="text-red-700 font-semibold text-xs rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="bg-orange-100 p-3 text-sm rounded-lg text-orange-500 text-center mt-4">
          You have not created any listings yet. To begin, please click the
          &quot;Create Listing&quot; button to initiate the listing creation
          process.
        </p>
      )}
      <hr className="my-5" />
      <div className="flex gap-3">
        {/* Buttons for account deletion and sign out */}
        <button
          onClick={handleSignOut}
          className="text-red-700 bg-red-100 hover:opacity-95 rounded-lg w-full p-2 font-medium uppercase text-sm"
        >
          Sign out
        </button>
        <button
          onClick={handleDeleteUser}
          className="text-red-700 bg-red-200 hover:opacity-95 rounded-lg w-full p-2 font-medium uppercase text-sm"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
