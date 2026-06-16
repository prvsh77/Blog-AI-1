import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'


const Navbar = () => {

    const navigate = useNavigate()

  return (
    <div className='sticky top-0 z-50 w-full glass-nav px-8 sm:px-20 xl:px-32 py-4 flex justify-between items-center shadow-sm'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="logo" className='w-32 sm:w-44 cursor-pointer hover:opacity-80 transition' />
      <button onClick={()=>navigate('/admin/addBlog')}  className='flex items-center gap-2 rounded-full text-sm cursor-pointer glass-button text-white px-8 py-2.5 font-medium shadow'>
       Generate Blog using AI
        <img src={assets.arrow} className='w-3' alt="arrow" />
      </button>
    </div>
  )
}

export default Navbar
