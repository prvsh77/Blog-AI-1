import React, { useState } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const BlogTableItem = ({blog, fetchBlogs, index}) => {

    const {title, createdAt, authorName} = blog;
    const BlogDate = new Date(createdAt)
    const isPending = blog.status === 'pending';

    const { axios } = useAppContext();
    const [rejecting, setRejecting] = useState(false);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    const deleteBlog = async ()=>{
      const confirm = window.confirm('Are you sure you want to delete this blog?')
      if(!confirm) return;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/delete`, {id: blog._id})
        if (data.success){
          toast.success(data.message)
          await fetchBlogs()
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const togglePublish = async () =>{
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/toggle-publish`, {id: blog._id})
        if (data.success){
          toast.success(data.message)
          await fetchBlogs()
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const review = async (action) => {
      try {
        setBusy(true)
        const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/admin/review`, { id: blog._id, action, reviewNote: note })
        if (data.success){
          toast.success(data.message)
          setRejecting(false)
          setNote('')
          await fetchBlogs()
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setBusy(false)
      }
    }

    const badge = blog.isLive
      ? { label: 'Published', className: 'text-green-600' }
      : isPending
        ? { label: 'Pending review', className: 'text-amber-600 font-semibold' }
        : blog.status === 'scheduled'
          ? { label: `Scheduled · ${new Date(blog.publishAt).toLocaleString()}`, className: 'text-blue-600' }
          : { label: 'Draft', className: 'text-orange-700' };

  return (
    <tr className='border-y border-gray-300'>
      <th className='px-2 py-4'>{ index }</th>
      <td className='px-2 py-4'>
        {title}
        {authorName && <p className='text-xs text-gray-500 font-normal mt-0.5'>by {authorName}</p>}
      </td>
      <td className='px-2 py-4 max-sm:hidden'> {BlogDate.toDateString()} </td>
      <td className='px-2 py-4 max-sm:hidden'>
        <p className={badge.className}>{badge.label}</p>
      </td>
      <td className='px-2 py-4 text-xs'>
        <div className='flex flex-wrap items-center gap-3'>
          {isPending ? (
            <>
              <button onClick={() => review('approve')} disabled={busy} className='border border-green-600 text-green-700 px-2 py-0.5 mt-1 rounded cursor-pointer hover:bg-green-50'>Approve</button>
              <button onClick={() => setRejecting(r => !r)} disabled={busy} className='border border-red-500 text-red-600 px-2 py-0.5 mt-1 rounded cursor-pointer hover:bg-red-50'>{rejecting ? 'Cancel' : 'Reject'}</button>
            </>
          ) : (
            <button onClick={togglePublish} className='border px-2 py-0.5 mt-1 rounded cursor-pointer'>{blog.isLive ? 'Unpublish' : 'Publish now'}</button>
          )}
          <img src={assets.cross_icon} className='w-8 hover:scale-110 transition-all cursor-pointer' alt="" onClick={deleteBlog}/>
        </div>
        {isPending && rejecting && (
          <div className='flex flex-wrap items-center gap-2 mt-2'>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder='Note to the author (optional)'
              className='border border-gray-300 rounded px-2 py-1 text-xs w-56'
            />
            <button onClick={() => review('reject')} disabled={busy} className='bg-red-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-red-700'>Confirm reject</button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default BlogTableItem
