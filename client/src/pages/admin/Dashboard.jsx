import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {

    const [dashboardData, setDashboardData] = useState({
        blogs: 0,
        comments: 0,
        drafts: 0,
        recentBlogs: []
    })

    const { axios } = useAppContext()

     const fetchDashboard = async ()=>{
       try {
         const {data} = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/dashboard`)
         data.success ? setDashboardData(data.dashboardData) : toast.error(data.message)
       } catch (error) {
            toast.error(error.message)
       }
     }

     useEffect(()=>{
        fetchDashboard()
     },[])

  return (
    <div className='flex-1 p-4 md:p-10 bg-red-50/50'>

        <div className='flex flex-wrap gap-4'>

            <div className='flex items-center gap-4 glass-card p-5 min-w-58 rounded-xl cursor-pointer'>
                <img src={assets.dashboard_icon_1} alt="" />
                <div>
                    <p className='text-xl font-semibold text-gray-800'>{dashboardData.blogs}</p>
                    <p className='text-gray-500 font-normal'>Blogs</p>
                </div>
            </div>

            <div className='flex items-center gap-4 glass-card p-5 min-w-58 rounded-xl cursor-pointer'>
                <img src={assets.dashboard_icon_2} alt="" />
                <div>
                    <p className='text-xl font-semibold text-gray-800'>{dashboardData.comments}</p>
                    <p className='text-gray-500 font-normal'>Comments</p>
                </div>
            </div>

            <div className='flex items-center gap-4 glass-card p-5 min-w-58 rounded-xl cursor-pointer'>
                <img src={assets.dashboard_icon_3} alt="" />
                <div>
                    <p className='text-xl font-semibold text-gray-800'>{dashboardData.drafts}</p>
                    <p className='text-gray-500 font-normal'>Drafts</p>
                </div>
            </div>
        </div>

        <div>
            <div className='flex items-center gap-3 m-4 mt-6 text-gray-700 font-semibold'>
                <img src={assets.dashboard_icon_4} alt="" />
                <p>Latest Blogs</p>
            </div>

            <div className='relative max-w-4xl overflow-x-auto glass-card p-4 rounded-xl scrollbar-hide'>
                <table className='w-full text-sm text-gray-600 bg-transparent'>
                    <thead className='text-xs text-gray-700 text-left uppercase border-b border-gray-200/50'>
                        <tr>
                            <th scope='col' className='px-2 py-4 xl:px-6'> # </th>
                            <th scope='col' className='px-2 py-4'> Blog Title </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Date </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Status </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.recentBlogs.map((blog, index)=>{
                            return <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchDashboard} index={index + 1}/>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      
    </div>
  )
}

export default Dashboard
