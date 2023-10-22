import { useEffect, useState } from "react";
import slugify from "slugify";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const handleChange = (e) => setMessage(e.target.value);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/user/${listing.userRef}`);
        if (!response.ok)
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        const data = await response.json();
        if (data.success === false) {
          setError(data.message);
          return;
        }
        setLandlord(data);
      } catch (error) {
        console.error("Error while fetching landlord data:", error.message);
        setError(
          "An error occurred while fetching data. Please try again later."
        );
      }
    })();
  }, [listing]);

  if (error)
    return <div className="text-center text-red-700">Error: {error}</div>;
  if (!landlord)
    return <div className="text-center text-slate-700">Loading...</div>;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        Contact <strong>{landlord.username}</strong> for{" "}
        <strong>{slugify(listing.title).toLowerCase()}</strong>
      </p>
      <textarea
        name="message"
        id="message"
        rows="10"
        placeholder="Enter your message here..."
        className="w-full border p-3 rounded-lg outline-none"
        value={message}
        onChange={handleChange}
      ></textarea>
      <Link
        to={`mailto:${landlord.email}?subject=Regarding ${listing.title}&body=${message}`}
        className="p-3 rounded-lg bg-green-700 text-center text-white text-sm uppercase hover:opacity-95"
      >
        Send message
      </Link>
    </div>
  );
}

Contact.propTypes = {
  listing: PropTypes.shape({
    userRef: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};
