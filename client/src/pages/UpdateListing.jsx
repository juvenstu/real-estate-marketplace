import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  // Redux state for the current user
  const { currentUser } = useSelector((state) => state.user);

  // State variables for form data and UI feedback
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageURLs: [],
    title: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const params = useParams();

  useEffect(() => {
    (async () => {
      const { listingId } = params;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    })();
  }, [params]);

  // Function to handle image uploads
  const handleImageUpload = () => {
    if (files.length === 0 || files.length + formData.imageURLs.length > 6) {
      // Set an error message if the upload conditions are not met
      setImageUploadError(
        "You must upload a minimum of 1 image and a maximum of 6 images per listing."
      );
      return;
    }

    // Initiates image upload process
    setUploading(true);
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      promises.push(storeImage(files[i]));
    }
    Promise.all(promises)
      .then((urls) => {
        // Update form data with uploaded image URLs
        setFormData((prev) => ({
          ...prev,
          imageURLs: prev.imageURLs.concat(urls),
        }));
        setImageUploadError(null);
        setUploading(false);
      })
      .catch(() => {
        // Handle image upload failure
        setImageUploadError(
          "The image upload failed because the file might have exceeded the maximum allowed size of 2 MB."
        );
        setUploading(false);
      });
  };

  // Function to upload an image to storage
  const storeImage = async (file) =>
    new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName =
        new Date().getTime() + file.name.replace(/ /g, "").toLowerCase();
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Resolve with the download URL of the uploaded image
            resolve(downloadURL);
          });
        }
      );
    });

  // Function to remove an image from the form data
  const handleRemoveImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      imageURLs: prev.imageURLs.filter((_, i) => i !== index),
    }));

  // Function to handle changes in form input fields
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    if (id === "sale" || id === "rent")
      setFormData((prev) => ({ ...prev, type: id }));
    if (id === "parking" || id === "furnished" || id === "offer")
      setFormData((prev) => ({ ...prev, [id]: checked }));
    if (type === "number" || type === "text" || type === "textarea")
      setFormData((prev) => ({
        ...prev,
        [id]: type === "number" ? parseInt(value) : value,
      }));
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageURLs.length < 1) {
      // Set an error message if no images are uploaded
      setError("To proceed, you are required to upload at least one image.");
      return;
    }

    // Initiate the listing updating process
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await response.json();

      if (data.success === false) setError(data.message);
      // Redirect to the updated listing
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  console.log(formData);

  return (
    <main className="p-3 max-w-4xl mx-auto">
      {/* Main container for the update listing form */}
      <h1 className="text-3xl my-7 font-semibold text-center">
        Update listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          {/* Input field for the listing title */}
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Title"
            maxLength={62}
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.title}
            required
          />

          {/* Textarea for the listing description */}
          <textarea
            name="description"
            id="description"
            rows="10"
            placeholder="Description"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.description}
            required
          ></textarea>

          {/* Input field for the listing address */}
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.address}
            required
          />

          {/* Checkboxes for listing type, parking, furnished, and offer */}
          <div className="flex flex-wrap gap-6">
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="sale"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="rent"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="parking"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="furnished"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="offer"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          {/* Input fields for bedrooms, bathrooms, regular price, and discounted price */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="bedrooms"
                id="bedrooms"
                min={1}
                max={10}
                className="p-2 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
                required
              />
              <p>Bedrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                min={1}
                max={10}
                className="p-2 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
                required
              />
              <p>Bathrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="regularPrice"
                id="regularPrice"
                min={50}
                max={10000000}
                className="p-2 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
                required
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                {formData.type === "rent" && (
                  <span className="text-xs">($ / month)</span>
                )}
              </div>
            </div>

            {/* Input field for discounted price if an offer is selected */}
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="discountPrice"
                  id="discountPrice"
                  min={50}
                  max={formData.regularPrice}
                  className="p-2 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                  required
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  {formData.type === "rent" && (
                    <span className="text-xs">($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          {/* Section for image uploads */}
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          {/* Input for selecting multiple image files */}
          <div className="flex gap-4">
            <input
              type="file"
              name="images"
              id="images"
              accept="image/*"
              className="p-2 border border-gray-300 rounded-lg w-full"
              onChange={(e) => setFiles(e.target.files)}
              multiple
            />

            {/* Button to trigger image upload */}
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading}
              className="p-2 text-green-700 border border-green-700 rounded-lg uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Display error message if image upload conditions are not met */}
          {imageUploadError && (
            <p className="text-red-700 text-sm text-center">
              {imageUploadError}
            </p>
          )}

          {/* Display uploaded images with delete buttons */}
          {formData.imageURLs.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.imageURLs.map((url, index) => (
                <div key={url} className="group relative">
                  <img
                    src={url}
                    alt="Listing image"
                    className="h-40 object-cover rounded-lg"
                  />

                  {/* Button to remove an uploaded image */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="hidden group-hover:block absolute absolute-center bg-red-700 text-white p-2 text-sm hover:opacity-95 transition duration-300 ease-in-out rounded-lg uppercase"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Button to submit the listing */}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update listing"}
          </button>

          {/* Display error message if form submission fails */}
          {error && <p className="text-red-700 text-center text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
