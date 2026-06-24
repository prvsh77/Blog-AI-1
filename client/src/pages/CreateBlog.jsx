import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const CreateBlog = () => {

  const { axios, userToken } = useAppContext();

  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append(
        "blog",
        JSON.stringify({
          title,
          subTitle,
          description,
          category,
          isPublished: true,
        })
      );

      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/blog/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (data.success) {
        toast.success("Blog created successfully");

        setTitle("");
        setSubTitle("");
        setDescription("");
        setImage(null);
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to create blog"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold mb-8">
          Create Blog
        </h1>

        <form
          onSubmit={submitHandler}
          className="space-y-6"
        >

          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="text"
            placeholder="Subtitle"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option>Technology</option>
            <option>Finance</option>
            <option>Lifestyle</option>
            <option>Startups</option>
          </select>

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <textarea
            rows={12}
            placeholder="Write your blog..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateBlog;