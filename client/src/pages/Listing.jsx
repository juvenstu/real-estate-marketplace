import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import pluralize from "pluralize";
import { useSelector } from "react-redux";
import Contact from "../components/Contact";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();

  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const { listingId } = params;
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(data.message);
        } else {
          setListing(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleContactClick = () => {
    setContact(true);
  };

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-red-700 text-center my-7 text-2xl">
          An error has occurred. Please refresh the page to resolve the issue.
        </p>
      )}
      {listing && !loading && !error && (
        <React.Fragment>
          <Swiper navigation>
            {listing.imageURLs?.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px] w-full"
                  style={{ background: `url(${url}) center/cover no-repeat` }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare className="text-slate-500" onClick={handleCopyLink} />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-6">
            <h1 className="font-semibold text-3xl">
              {listing.title} - $
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </h1>
            <p className="flex items-center gap-2 text-slate-600 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              <span className="font-semibold">{listing.address}</span>
            </p>
            <div className="flex items-center gap-3">
              <button className="bg-red-900 min-w-[200px] text-white text-center p-2 px-3 text-sm rounded-lg uppercase">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </button>
              {listing.offer && (
                <p className="text-green-900 bg-green-200 p-1 px-2 rounded-lg font-bold uppercase text-xs">
                  {Math.round(
                    ((+listing.regularPrice - +listing.discountPrice) /
                      listing.regularPrice) *
                      100
                  )}
                  % OFF
                </p>
              )}
            </div>
            <p className="text-slate-800">{listing.description}</p>
            <ul className="text-green-900 font-semibold text-sm flex items-center gap-4 sm:gap-6 flex-wrap">
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaBed />
                <span>
                  {listing.bedrooms} {pluralize("Bed", listing.bedrooms)}
                </span>
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaBath />
                <span>
                  {listing.bathrooms} {pluralize("Bath", listing.bathrooms)}
                </span>
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaParking />
                <span>{listing.parking ? "Parking Spot" : "No Parking"}</span>
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaChair />
                <span>{listing.furnished ? "Furnished" : "Unfurnished"}</span>
              </li>
            </ul>
            {currentUser &&
              currentUser._id !== listing?.userRef &&
              (!contact ? (
                <button
                  onClick={handleContactClick}
                  className="bg-slate-700 text-white uppercase rounded-lg p-3 hover:opacity-95"
                >
                  Contact landlord
                </button>
              ) : (
                <Contact listing={listing} />
              ))}
          </div>
        </React.Fragment>
      )}
    </main>
  );
}
