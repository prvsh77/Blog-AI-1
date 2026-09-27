import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';

const badgeFor = (blog) => {
  if (blog.isLive) return { label: 'Published', className: 'bg-green-100 text-green-700' };
  if (blog.status === 'pending') return { label: 'Pending review', className: 'bg-amber-100 text-amber-700' };
  if (blog.status === 'scheduled') return { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' };
  return { label: 'Draft', className: 'bg-gray-100 text-gray-700' };
};

// The status-changing action an author can take from each state (server enforces the same rules).
const toggleLabelFor = (blog) => {
  if (blog.isLive) return 'Unpublish';
  if (blog.status === 'pending') return 'Withdraw';
  if (blog.status === 'scheduled') return null;
  return 'Submit for review';
};

const MyPosts = () => {
  const { axios, userToken } = useAppContext();
  const authHeaders = { headers: { Authorization: `Bearer ${userToken}` } };
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/mine`, authHeaders);
      if (data.success) setBlogs(data.blogs);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (path, id) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}${path}`, { id }, authHeaders);
      if (data.success) {
        toast.success(data.message);
        await fetchMine();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const remove = (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    act('/api/blog/delete', blog._id);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold">My posts</h1>
          <Link to="/write" className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow hover:bg-red-700">Write a post</Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h2 className="text-2xl font-semibold">No posts yet</h2>
            <p className="text-gray-500 mt-2">Drafts stay private; submitted posts appear on the site once approved.</p>
            <Link to="/write" className="inline-block mt-6 px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold">Write your first post</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {blogs.map((blog) => {
              const badge = badgeFor(blog);
              const toggleLabel = toggleLabelFor(blog);
              return (
                <li key={blog._id} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row gap-5" data-post-title={blog.title}>
                  <img src={blog.image} alt="" className="w-full sm:w-40 h-28 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`} data-status>{badge.label}</span>
                      <span className="text-xs text-red-500">{blog.category}</span>
                    </div>
                    <h2 className="text-xl font-bold mt-2 truncate">{blog.title}</h2>
                    {blog.subTitle && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{blog.subTitle}</p>}
                    {blog.status === 'draft' && blog.reviewNote && (
                      <p className="mt-3 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2" data-review-note>
                        <span className="font-semibold">Reviewer note:</span> {blog.reviewNote}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4 text-xs font-semibold">
                      <Link to={`/blog/${blog._id}`} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">View</Link>
                      <Link to={`/write/${blog._id}`} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">Edit</Link>
                      {toggleLabel && (
                        <button onClick={() => act('/api/blog/toggle-publish', blog._id)} className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 cursor-pointer">{toggleLabel}</button>
                      )}
                      <button onClick={() => remove(blog)} className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-600 cursor-pointer">Delete</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
