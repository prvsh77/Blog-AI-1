import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const Bookmarks = () => {
  const { axios, userToken } = useAppContext();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/blog/bookmarks`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          My Bookmarks
        </h1>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No bookmarks yet
            </h2>

            <p className="text-gray-500 mt-2">
              Save blogs to read later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">

                  <span className="text-sm text-red-500">
                    {blog.category}
                  </span>

                  <h2 className="text-xl font-bold mt-2">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 mt-3">
                    {blog.subTitle}
                  </p>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Bookmarks;