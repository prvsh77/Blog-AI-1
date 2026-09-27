import React, { useEffect, useState } from 'react'
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'pending', label: 'Pending review', match: b => b.status === 'pending' },
  { key: 'draft', label: 'Drafts', match: b => b.status === 'draft' },
  { key: 'scheduled', label: 'Scheduled', match: b => b.status === 'scheduled' && !b.isLive },
  { key: 'published', label: 'Published', match: b => b.isLive },
];

const ListBlog = () => {

 const [blogs, setBlogs] = useState([]);
 const [filter, setFilter] = useState('all');
 const {axios} = useAppContext()

 const fetchBlogs = async () =>{
    try {
        const {data} = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/blogs`)
        if(data.success){
            setBlogs(data.blogs)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
 }

 useEffect(()=>{
    fetchBlogs()
 },[])

 const active = FILTERS.find(f => f.key === filter) || FILTERS[0];
 const visible = blogs.filter(active.match);

  return (
    <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-red-50/50'>
        <h1>All blogs</h1>

        <div className='flex flex-wrap gap-2 mt-4 max-w-4xl' role='tablist'>
            {FILTERS.map(f => {
                const count = blogs.filter(f.match).length;
                const selected = f.key === filter;
                return (
                    <button
                        key={f.key}
                        role='tab'
                        aria-selected={selected}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selected ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400'}`}
                    >
                        {f.label} <span className={selected ? 'text-red-100' : 'text-gray-400'}>({count})</span>
                    </button>
                );
            })}
        </div>

        <div className='relative h-4/5 mt-4 max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide glass-card p-4'>
                <table className='w-full text-sm text-gray-600 bg-transparent'>
                    <thead className='text-xs text-gray-700 text-left uppercase border-b border-gray-200/50'>
                        <tr>
                            <th scope='col' className='px-2 py-4 xl:px-6'> # </th>
                            <th scope='col' className='px-2 py-4'> Blog Title </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Date </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Status </th>
                            <th scope='col' className='px-2 py-4'> Actions </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((blog, index)=>{
                            return <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1}/>
                        })}
                        {visible.length === 0 && (
                            <tr><td colSpan={5} className='px-2 py-8 text-center text-gray-400'>No posts in this view.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
    </div>
  )
}

export default ListBlog
