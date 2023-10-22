import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import PropTypes from "prop-types";

const defaultImage =
  "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg";

export default function ListingItem({ listing }) {
  const {
    _id,
    imageURLs,
    title,
    address,
    description,
    offer,
    regularPrice,
    discountPrice,
    type,
    bedrooms,
    bathrooms,
  } = listing;
  const imageUrl = imageURLs[0] || defaultImage;

  const formattedPrice = offer
    ? discountPrice.toLocaleString("en-US")
    : regularPrice.toLocaleString("en-US");
  const priceSuffix = type === "rent" ? " / month" : "";

  const bedroomText = `${
    bedrooms > 1 ? `${bedrooms} beds` : `${bedrooms} bed`
  }`;
  const bathroomText = `${
    bathrooms > 1 ? `${bathrooms} baths` : `${bathrooms} bath`
  }`;

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]">
      <Link to={`/listing/${_id}`}>
        <img
          src={imageUrl}
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="truncate text-lg font-semibold text-slate-700">
            {title}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">{address}</p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <p className="text-slate-500 mt-2 font-semibold ">
            ${formattedPrice}
            {priceSuffix}
          </p>
          <div className="text-slate-700 flex gap-4">
            <div className="font-bold text-xs">{bedroomText}</div>
            <div className="font-bold text-xs">{bathroomText}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}

ListingItem.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageURLs: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    offer: PropTypes.bool.isRequired,
    regularPrice: PropTypes.number.isRequired,
    discountPrice: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    bedrooms: PropTypes.number.isRequired,
    bathrooms: PropTypes.number.isRequired,
  }),
};
