import { current } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-fill.svg";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateURL(searchTerm);
  };

  const updateURL = (searchTerm) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const location = useLocation();
  useEffect(() => {
    const initializeSearchTerm = () => {
      const urlParams = new URLSearchParams(location.search);
      const searchTerm = urlParams.get("searchTerm");
      if (searchTerm) setSearchTerm(searchTerm);
    };

    initializeSearchTerm();
  }, [location.search]);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <img src={logo} className="w-[40px]" alt="Real Estate Marketplace" />
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center w-24 sm:w-64"
        >
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search..."
            className="bg-transparent outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button>
            <FaSearch className="text-slate-500" />
          </button>
        </form>
        <ul className="flex gap-4">
          <li className="hidden sm:inline text-slate-700 hover:underline">
            <Link to="/">Home</Link>
          </li>
          <li className="hidden sm:inline text-slate-700 hover:underline">
            <Link to="/about">About</Link>
          </li>
          <Link to={current ? "/profile" : "/sign-in"}>
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="rounded-full w-7 h-7 object-cover"
              />
            ) : (
              <li className="text-slate-700 hover:underline">Sign In</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
