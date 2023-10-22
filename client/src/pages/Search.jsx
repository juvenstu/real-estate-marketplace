import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";

export default function Search() {
  const navigate = useNavigate();

  // Initialize state variables using object destructuring
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // Use a single useEffect for managing query parameters and fetching data
  const location = useLocation();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParamNames = [
      "searchTerm",
      "type",
      "parking",
      "furnished",
      "offer",
      "sort",
      "order",
    ];

    const updatedSidebarData = {};

    queryParamNames.forEach((paramName) => {
      const paramValue = urlParams.get(paramName);
      if (paramName === "searchTerm") {
        updatedSidebarData[paramName] = paramValue || "";
      } else if (paramName === "type") {
        updatedSidebarData[paramName] = paramValue || "all";
      } else if (paramName === "sort") {
        updatedSidebarData[paramName] = paramValue || "created_at";
      } else if (paramName === "order") {
        updatedSidebarData[paramName] = paramValue || "desc";
      } else {
        updatedSidebarData[paramName] = paramValue === "true" ? true : false;
      }
    });

    setSidebarData((prevState) => ({ ...prevState, ...updatedSidebarData }));
    

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      setShowMore(data.length > 8);
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location]);

  // Define handleChange function for input changes
  const handleChange = (e) => {
    const id = e.target.id;
    const value =
      id === "all" || id === "rent" || id === "sale"
        ? e.target.id
        : id === "searchTerm"
        ? e.target.value
        : e.target.checked || e.target.checked === "true"
        ? true
        : false;

    if (id === "all" || id === "rent" || id === "sale")
      setSidebarData((prevState) => ({ ...prevState, type: value }));
    else setSidebarData((prevState) => ({ ...prevState, [id]: value }));
  };

  // Define handleSubmit function for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    Object.entries(sidebarData).forEach(([key, value]) => {
      if (key === "type" && value === "all") return;
      if (key !== "sort" && key !== "order" && value) {
        urlParams.set(key, value);
      }
    });

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    setShowMore(data.length < 9 ? false : true);
    setListings((prevListings) => [...prevListings, ...data]);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="p-7  border-b-2 md:border-r-2 md:min-h-screen">
        {/* Sidebar form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Search Term Input */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          {/* Type and Offer Checkboxes */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            {["all", "rent", "sale"].map((type) => (
              <div className="flex gap-2" key={type}>
                <input
                  type="checkbox"
                  id={type}
                  className="w-5"
                  onChange={handleChange}
                  checked={sidebarData.type === type}
                />
                <span className="capitalize">
                  {type === "all" ? "Rent & Sale" : type}
                </span>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          {/* Amenities Checkboxes */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>
            {["parking", "furnished"].map((amenity) => (
              <div className="flex gap-2" key={amenity}>
                <input
                  type="checkbox"
                  id={amenity}
                  className="w-5"
                  onChange={handleChange}
                  checked={sidebarData[amenity]}
                />
                <span>
                  {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                </span>
              </div>
            ))}
          </div>
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={`${sidebarData.sort}_${sidebarData.order}`}
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          {/* Search Button */}
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>

      {/* Listings Display */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">No listings found!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
