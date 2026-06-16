import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Sidebar = () => {
  return (
    <div className='flex flex-col glass-nav border-r border-white/20 min-h-full pt-6 shadow-sm'>

      <NavLink end={true} to='/admin' className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer transition-all ${isActive ? "bg-red-500/10 border-r-4 border-red-600 font-semibold" : "hover:bg-white/20"}`}>
        <img src={assets.home_icon} alt="" className='min-w-4 w-5 '/>
        <p className='hidden md:inline-block'>Dashboard</p>
      </NavLink>

      <NavLink to='/admin/addBlog' className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer transition-all ${isActive ? "bg-red-500/10 border-r-4 border-red-600 font-semibold" : "hover:bg-white/20"}`}>
        <img src={assets.add_icon} alt="" className='min-w-4 w-5 '/>
        <p className='hidden md:inline-block'>Add blogs</p>
      </NavLink>

      <NavLink to='/admin/listBlog' className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer transition-all ${isActive ? "bg-red-500/10 border-r-4 border-red-600 font-semibold" : "hover:bg-white/20"}`}>
        <img src={assets.list_icon} alt="" className='min-w-4 w-5 '/>
        <p className='hidden md:inline-block'>Blog lists</p>
      </NavLink>

      <NavLink to='/admin/comments' className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer transition-all ${isActive ? "bg-red-500/10 border-r-4 border-red-600 font-semibold" : "hover:bg-white/20"}`}>
        <img src={assets.comment_icon} alt="" className='min-w-4 w-5 '/>
        <p className='hidden md:inline-block'>Comments</p>
      </NavLink>

    </div>
  )
}

export default Sidebar
