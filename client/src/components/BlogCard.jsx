import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const BlogCard = ({ blog }) => {

  const { axios, userToken } = useAppContext();

  const toggleBookmark = async () => {
    try {

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/bookmark`,
        {
          blogId: blog._id
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      if (data.success) {
        toast.success("Bookmark updated");
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to update bookmark"
      );

    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-4 relative">

      <button
        onClick={toggleBookmark}
        className="absolute top-4 right-4 bg-white shadow rounded-full p-2 hover:scale-110 transition"
      >
        🔖
      </button>

      <img
        src={blog.image}
        className="h-48 w-full object-cover rounded-lg"
      />

      <h2 className="text-xl font-semibold mt-3">
        {blog.title}
      </h2>

      <p className="text-gray-500 mt-2">
        {blog.content?.slice(0, 100)}...
      </p>

    </div>
  );
};

export default BlogCard;