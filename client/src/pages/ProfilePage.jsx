// Importing required modules and components
import React, { useContext, useState } from "react";
import assets from "../assets/assets"; // Static assets like icons
import { useNavigate } from "react-router-dom"; // For page navigation
import { AuthContext } from "../../context/AuthContext"; // Context to manage authentication state

// Component: ProfilePage
// Allows user to update their profile picture, name, and bio
const ProfilePage = () => {
  // Get the current authenticated user and profile update function from context
  const { authUser, updateProfile } = useContext(AuthContext);

  // State for storing selected image, name, and bio
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName); // Pre-fill name
  const [bio, setBio] = useState(authUser.bio);        // Pre-fill bio

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If no image is selected, update only name and bio
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/"); // Redirect to homepage
      return;
    }

    // Convert image to base64 string for storage
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;

      // Update profile with image, name, and bio
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/"); // Redirect to homepage
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div
        className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg"
      >
        {/* Profile form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>

          {/* Upload profile image */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            {/* Preview selected image or fallback to default avatar */}
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt="avatar"
              className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
            />
            upload profile image
          </label>

          {/* Input for full name */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Input for bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="write profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        {/* Display current profile image (or logo if none) */}
        <img
          className={`max-w-44 aspect-square rounded-full max-10 max-sm:mt-10 ${
            selectedImg && "rounded-full"
          }`}
          src={authUser?.profilePic || assets.logo_icon}
          alt="profile"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
