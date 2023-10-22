import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setter(data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchAllListings = async () => {
      await fetchData("/api/listing/get?offer=true&limit=4", setOfferListings);
      await fetchData("/api/listing/get?type=sale&limit=4", setSaleListings);
      await fetchData("/api/listing/get?type=rent&limit=4", setRentListings);
    };

    fetchAllListings();
  }, []);

  const renderListingSection = (title, listings, queryParam) => {
    return (
      <div className="">
        <div className="my-3">
          <h2 className="text-2xl font-semibold text-slate-600">{title}</h2>
          <Link
            className="text-sm text-blue-800 hover:underline"
            to={`/search?${queryParam}`}
          >
            Show more {title.toLowerCase()}
          </Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {listings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* top */}
      <div className="bg-blue-200">
        <div className="z-[3] flex flex-col gap-6 p-28 px-3 max-w-6xl items-start mx-auto">
          <h1 className="text-slate-700 font-bold text-3xl max-w-xl lg:text-6xl">
            Discover Your <span className="text-slate-500">Dream Home</span> Today
          </h1>
          <div className="text-black-400 text-sm max-w-lg">
            Explore a world of possibilities in the real estate market. Whether
            you&apos;re buying, selling, or renting, our intuitive platform
            connects you to the perfect property. Get started now and turn your
            dream home into a reality.
          </div>
          <Link
            to={"/search"}
            className="text-xs sm:text-sm bg-slate-700 text-white uppercase inline-block rounded-lg p-3 hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </div>

      {/* listing results for offer, sale, and rent */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings &&
          offerListings.length > 0 &&
          renderListingSection("Recent offers", offerListings, "offer=true")}
        {rentListings &&
          rentListings.length > 0 &&
          renderListingSection(
            "Recent places for rent",
            rentListings,
            "type=rent"
          )}
        {saleListings &&
          saleListings.length > 0 &&
          renderListingSection(
            "Recent places for sale",
            saleListings,
            "type=sale"
          )}
      </div>
    </div>
  );
}
