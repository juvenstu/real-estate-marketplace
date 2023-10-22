import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

export default function SignIn() {
  // Initialize state variables to manage form data, errors, and loading state.
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate(); // Initialize variable for navigating to another page

  const dispatch = useDispatch();

  // This function handles changes in form input fields and updates the formData state.
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  // This function handles the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior.

    try {
      dispatch(signInStart()); // Dispatch the sign-in start action to indicate loading.

      // Send a POST request to the server's "/api/auth/signin" endpoint with form data.
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-type": "application/json", // Set the content type for JSON data.
        },
        body: JSON.stringify(formData), // Convert the form data to JSON and send it in the request body.
      });

      const data = await res.json(); // Parse the response JSON data.

      // Check if the sign-in was successful or not.
      if (data.success === false) {
        dispatch(signInFailure(data.message)); // Dispatch the sign-in failure action with the error message.
        return;
      }

      dispatch(signInSuccess(data)); // Dispatch the sign-in success action with user data.
      navigate("/"); // Navigate to the home page on successful sign-in.
    } catch (error) {
      dispatch(signInFailure()); // Dispatch the sign-in failure action in case of an error.
    }
  };

  // Render the sign-in form and related UI elements.
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          autoComplete="on"
          className="border outline-none px-3 py-2 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          className="border outline-none px-3 py-2 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 outline-none"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
        <OAuth /> 
        <div className="flex gap-1 mt-5">
          <p>Don&apos;t have an account?</p>
          <Link to="/sign-up">
            <span className="text-blue-600 font-medium">Sign up</span>
          </Link>
        </div>
        {error && <p className="text-red-800 mt-5 text-center">{error}</p>}
      </form>
    </div>
  );
}
