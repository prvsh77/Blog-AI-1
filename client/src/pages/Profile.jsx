import { useAppContext } from "../context/AppContext";

const Profile = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Cover Banner */}
        <div className="h-48 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-300" />

        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-2xl p-8 -mt-16 relative text-center">

          {/* Avatar */}
          <img
            src={currentUser.avatar}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-white object-cover mx-auto"
          />

          {/* Name */}
          <h1 className="text-3xl font-bold mt-4">
            {currentUser.name}
          </h1>

          {/* Email */}
          <p className="text-gray-500">
            {currentUser.email}
          </p>

          {/* Joined Date */}
          <p className="text-sm text-gray-400 mt-2">
            Joined{" "}
            {new Date(currentUser.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">

            <div className="bg-gray-50 rounded-xl py-4">
              <h2 className="text-2xl font-bold">0</h2>
              <p className="text-gray-500">Blogs</p>
            </div>

            <div className="bg-gray-50 rounded-xl py-4">
              <h2 className="text-2xl font-bold">
                {currentUser.bookmarks?.length || 0}
              </h2>
              <p className="text-gray-500">Bookmarks</p>
            </div>

            <div className="bg-gray-50 rounded-xl py-4">
              <h2 className="text-2xl font-bold">0</h2>
              <p className="text-gray-500">Likes</p>
            </div>

          </div>

          {/* About Me */}
          <div className="mt-10 border-t pt-8 text-left">
            <h2 className="text-xl font-semibold mb-3">
              About Me
            </h2>

            <p className="text-gray-600">
              {currentUser.bio || "No bio added yet."}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;