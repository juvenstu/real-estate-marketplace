import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  // Initialize state variables to manage form data, errors, and loading state.
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize variable for navigating to another page

  // This function handles changes in form input fields and updates the formData state.
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  // This function handles the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior.

    try {
      setLoading(true); // Set loading state to indicate that the submission is in progress.

      // Send a POST request to the server's "/api/auth/signup" endpoint with form data.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-type": "application/json", // Set the content type for JSON data.
        },
        body: JSON.stringify(formData), // Convert the form data to JSON and send it in the request body.
      });

      const data = await res.json(); // Parse the response JSON data.

      // Check if the signup was successful or not.
      if (data.success === false) {
        setError(data.message); // Set the error message from the server.
        return;
      }

      setError(null); // Clear error if everything is fine.
      navigate("/sign-in"); // Navigate to the sign-in page on successful signup.
    } catch (error) {
      setError(error.message); // Set the error state to the error message in case of an exception.
    } finally {
      setLoading(false); // Ensure that the loading state is set to false after the submission (success or error).
    }
  };

  // Render the signup form and related UI elements.
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          className="border outline-none px-3 py-2 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
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
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <OAuth />
        <div className="flex gap-1 mt-5">
          <p>Have an account?</p>
          <Link to="/sign-in">
            <span className="text-blue-600 font-medium">Sign in</span>
          </Link>
        </div>
        {error && <p className="text-red-800 mt-5 text-center">{error}</p>}
      </form>
    </div>
  );
}
