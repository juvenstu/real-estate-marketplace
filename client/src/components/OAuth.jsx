import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
  // Initialize Redux dispatch and navigation functions.
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract the loading state from the Redux store.
  const { loading } = useSelector((state) => state.user);

  // Handle Google sign-in button click.
  const handleGoogleClick = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart()); // Dispatch the sign-in start action to indicate loading.

      // Set up Google authentication provider and get Firebase auth instance.
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      // Sign in with Google using a popup.
      const { user } = await signInWithPopup(auth, provider);

      // Send user data to the server for further processing.
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
        }),
      });

      // Parse the response data.
      const data = await result.json();

      // Check if the sign-in was successful or not.
      if (data.success === false) {
        dispatch(signInFailure(data.message)); // Dispatch the sign-in failure action with the error message.
        return;
      }

      dispatch(signInSuccess(data)); // Dispatch the sign-in success action with user data.
      navigate("/"); // Navigate to the home page on successful sign-in.
    } catch (error) {
      dispatch(signInFailure(error)); // Dispatch the sign-in failure action in case of an error.
    }
  };

  // Render the Google sign-in button.
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={handleGoogleClick}
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Continue with Google"}
    </button>
  );
}
