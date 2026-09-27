import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quill from 'quill';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { blogCategories } from '../assets/assets';
import Navbar from '../components/Navbar';

const STATUS_LABEL = { draft: 'Draft', pending: 'Pending review', published: 'Published', scheduled: 'Scheduled' };

// Create (/write) or edit (/write/:id) a post as a signed-in author.
// Authors can only save drafts or submit for review; publishing is the admin's step.
const WritePost = () => {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { axios, userToken, currentUser } = useAppContext();
  const authHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [current, setCurrent] = useState(null); // { status, isLive, reviewNote } when editing
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
    }
  }, []);

  useEffect(() => {
    if (!editing) return;
    const load = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/${id}`, authHeaders);
        if (!data.success) {
          toast.error(data.message);
          return navigate('/my-posts');
        }
        const blog = data.blog;
        if (!blog.author || String(blog.author) !== String(currentUser?._id)) {
          toast.error('You can only edit your own posts');
          return navigate('/my-posts');
        }
        setTitle(blog.title || '');
        setSubTitle(blog.subTitle || '');
        setCategory(blog.category || 'Technology');
        setExistingImage(blog.image || '');
        setCurrent({ status: blog.status, isLive: blog.isLive, reviewNote: blog.reviewNote });
        if (quillRef.current) quillRef.current.root.innerHTML = blog.description || '';
      } catch (error) {
        toast.error(error.message);
        navigate('/my-posts');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (status) => {
    const description = quillRef.current?.root.innerHTML || '';
    if (!title.trim()) return toast.error('Please add a title');
    if (!description.replace(/<[^>]*>/g, '').trim()) return toast.error('Please write some content');

    try {
      setSaving(true);
      const payload = { title, subTitle, description, category };
      if (status) payload.status = status;
      const formData = new FormData();
      formData.append('blog', JSON.stringify(payload));
      if (image) formData.append('image', image);

      const { data } = editing
        ? await axios.put(`${import.meta.env.VITE_BASE_URL}/api/blog/${id}`, formData, authHeaders)
        : await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/submit`, formData, authHeaders);

      if (data.success) {
        toast.success(data.message);
        navigate('/my-posts');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  // Which buttons make sense depends on the post's current state.
  const actions = [];
  if (!editing) {
    actions.push({ label: 'Save as draft', status: 'draft', secondary: true }, { label: 'Submit for review', status: 'pending' });
  } else if (current?.isLive || current?.status === 'scheduled') {
    actions.push({ label: 'Save changes (goes back for review)', status: undefined });
  } else if (current?.status === 'pending') {
    actions.push({ label: 'Withdraw to draft', status: 'draft', secondary: true }, { label: 'Save changes', status: undefined });
  } else {
    actions.push({ label: 'Save draft', status: undefined, secondary: true }, { label: 'Submit for review', status: 'pending' });
  }

  const inputClass = 'w-full mt-2 p-3 bg-white border border-gray-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none text-sm';

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <div className="bg-white border border-gray-200/50 shadow-xl rounded-2xl p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{editing ? 'Edit post' : 'Write a post'}</h1>
          <p className="text-sm text-gray-500 mb-6">Posts you submit are reviewed before they appear on the site.</p>

          {editing && current && (
            <div className="mb-6 text-sm rounded-xl border border-gray-200 bg-slate-50 p-4">
              <p>Current status: <span className="font-semibold">{STATUS_LABEL[current.status] || current.status}</span></p>
              {(current.isLive || current.status === 'scheduled') && (
                <p className="text-amber-700 mt-1">Saving changes to a published post sends it back for review; it will be hidden until approved again.</p>
              )}
              {current.reviewNote && (
                <p className="mt-2 text-gray-700"><span className="font-semibold">Reviewer note:</span> {current.reviewNote}</p>
              )}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading post…</p>
          ) : null}

          <form onSubmit={(e) => e.preventDefault()} className={loading ? 'hidden' : ''}>
            <label className="block font-semibold text-sm text-gray-800">Title
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="An inspiring title" required className={inputClass} />
            </label>

            <label className="block font-semibold text-sm text-gray-800 mt-5">Subtitle
              <input type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="Brief summary" className={inputClass} />
            </label>

            <p className="font-semibold text-sm text-gray-800 mt-5">Content</p>
            <div className="mt-2 mb-4">
              <div ref={editorRef} className="rounded-xl border border-gray-200 bg-white min-h-[240px]"></div>
            </div>

            <label className="block font-semibold text-sm text-gray-800 mt-5">Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {blogCategories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="block font-semibold text-sm text-gray-800 mt-5">Cover image
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} className="block mt-2 text-sm" />
            </label>
            {existingImage && !image && <p className="text-xs text-gray-500 mt-1">Current image will be kept unless you choose a new one.</p>}

            <div className="flex flex-wrap gap-3 mt-8">
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  disabled={saving}
                  onClick={() => save(a.status)}
                  className={a.secondary
                    ? 'px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer'
                    : 'px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white font-bold text-sm shadow-md hover:shadow-lg cursor-pointer'}
                >
                  {saving ? 'Saving…' : a.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WritePost;
