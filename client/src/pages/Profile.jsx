import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage"; // Ensure you have firebase storage set up
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom"; // Import Link for navigation
import { useDispatch } from "react-redux";
import { set } from "mongoose";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0); // Track upload progress
  const [fileUploadError, setFileUploadError] = useState(false); // Track upload errors
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false); // Track update success
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch(); // Initialize Redux dispatch

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name; // Create a unique file name
    const storageRef = ref(storage, fileName); // Create a reference to the file location
    const uploadTask = uploadBytesResumable(storageRef, file); // Start the upload

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress)); // Update the progress percentage
      },
      (error) => {
        fileUploadError(true); // Set error state if there's an error during upload
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL }); // Update formData with the new avatar URL
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value }); // Update formData with input values
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart()); // Dispatch action to start update
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json(); // Get the response data
      if (data.success === false) {
        dispatch(updateUserFailure(data.message)); // Dispatch failure action if there's an error
        return;
      }
      dispatch(updateUserSuccess(data)); // Dispatch success action with the updated user data
      setUpdateSuccess(true); // Set update success state
    } catch (error) {
      dispatch(updateUserFailure(error.message)); // Dispatch failure action if there's an error
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart()); // Dispatch action to start deletion
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json(); // Get the response data
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message)); // Dispatch failure action if there's an error
        return;
      }
      dispatch(deleteUserSuccess(data)); // Dispatch success action on successful deletion
    } catch (error) {
      dispatch(deleteUserFailure(error.message)); // Dispatch failure action if there's an error
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart()); // Dispatch action to start sign out
      const res = await fetch("/api/auth/signout");
      const data = await res.json(); // Get the response data
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message)); // Dispatch failure action if there's an error
        return;
      }
      dispatch(signOutUserSuccess(data)); // Dispatch success action on successful sign out
    } catch (error) {
      dispatch(signOutUserFailure(error.message)); // Dispatch failure action if there's an error
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        method: "GET",
      });
      const data = await res.json(); // Get the response data
      if (data.success === false) {
        setShowListingError(true);
        return;
      }
      setUserListings(data); // Set the user listings state
    } catch (error) {
      setShowListingError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json(); // Get the response data
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== listingId)
      ); // Update the user listings state to remove the deleted listing
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload(image must be less than 2mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingError ? "Error showing listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
