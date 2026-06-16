import React, { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { blogCategories } from '../assets/assets'

// Helper to normalize and clean category names (fixing DB typos on-the-fly)
const normalizeCategory = (cat) => {
  if (!cat) return 'Article';
  const trimmed = cat.trim();
  if (trimmed.toLowerCase() === 'artifical intelligence' || trimmed.toLowerCase() === 'artificial intelligence') {
    return 'Artificial Intelligence';
  }
  return trimmed;
};

const BlogCard = ({ blog, index }) => {
  const { title, description, category, image, _id, subTitle } = blog
  const navigate = useNavigate()
  
  // Clean description HTML to plain text in case subTitle is missing
  const cleanSubTitle = subTitle || (description ? description.replace(/<[^>]*>/g, '') : '')

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/blog/${_id}`)}
      className="group relative overflow-hidden rounded-2xl glass-card cursor-pointer border border-white/30 bg-white/40 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-500 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-52 sm:h-56 flex-shrink-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Premium Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-full shadow-md uppercase tracking-wider">
            {normalizeCategory(category)}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow justify-between text-slate-800">
        <div>
          <h3 className="font-bold text-lg sm:text-xl mb-2 leading-snug group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          {cleanSubTitle && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 font-normal mb-4">
              {cleanSubTitle}
            </p>
          )}
        </div>
        
        {/* Read More Trigger */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-black/5">
          <span className="text-xs font-semibold text-red-500 group-hover:text-red-600 transition-colors duration-300">Read Article</span>
          <div className="w-7 h-7 bg-red-500/10 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-all duration-300">
            <svg className="w-3.5 h-3.5 text-red-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

const BlogList = () => {
  const [menu, setMenu] = useState("All")
  const { blogs, input } = useAppContext()

  const filteredBlogs = () => {
    if (!blogs || blogs.length === 0) {
      return []
    }

    let filtered = blogs
    
    // Filter by search input
    if (input && input.trim() !== '') {
      filtered = filtered.filter((blog) => 
        blog.title.toLowerCase().includes(input.toLowerCase()) || 
        normalizeCategory(blog.category).toLowerCase().includes(input.toLowerCase()) ||
        (blog.description && blog.description.toLowerCase().includes(input.toLowerCase()))
      )
    }
    
    // Filter by category
    if (menu !== "All") {
      filtered = filtered.filter((blog) => normalizeCategory(blog.category) === normalizeCategory(menu))
    }
    
    return filtered
  }

  const displayBlogs = filteredBlogs()

  return (
    <div className='min-h-screen bg-white/10 backdrop-blur-[2px]'>
      {/* Header Section */}
      <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8'>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-12'
        >
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 bg-clip-text text-transparent mb-4'>
            Discover Stories
          </h1>
          <p className='text-gray-600 text-base sm:text-lg max-w-2xl mx-auto'>
            Explore our curated collection of articles across various topics
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='flex flex-wrap justify-center gap-2 sm:gap-3 mb-8'
        >
          {blogCategories && blogCategories.map((item) => (
            <button 
              key={item}
              onClick={() => setMenu(item)}
              className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm overflow-hidden ${
                menu === item 
                  ? 'text-white shadow-lg scale-105' 
                  : 'text-gray-700 bg-white/45 backdrop-blur-sm hover:bg-white/60 border border-white/50 shadow-sm hover:shadow-md hover:scale-105'
              }`}
            >
              {menu === item && (
                <motion.div 
                  layoutId='category-bg' 
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className='absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500'
                />
              )}
              <span className='relative z-10'>{item}</span>
            </button>
          ))}
        </motion.div>

        {/* Search Results Info */}
        {input && input.trim() !== '' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center mb-6'
          >
            <p className='text-sm text-gray-600'>
              Found <span className='font-bold text-gray-900 text-lg'>{displayBlogs.length}</span> {displayBlogs.length === 1 ? 'result' : 'results'} for 
              <span className='font-semibold text-transparent bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text'> "{input}"</span>
              {menu !== "All" && <span> in <span className='font-semibold text-gray-900'>{menu}</span></span>}
            </p>
          </motion.div>
        )}
      </div>

      {/* Blog Grid */}
      <div className='max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16'>
        <AnimatePresence mode="wait">
          {displayBlogs && displayBlogs.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
          >
            {displayBlogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='text-center py-20'
            >
              <div className='w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center'>
                <svg className='w-10 sm:w-12 h-10 sm:h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>No articles found</h3>
              <p className='text-gray-600 mb-6 text-sm sm:text-base'>Try adjusting your search or filter to find what you're looking for.</p>
              <button 
                onClick={() => setMenu("All")}
                className='px-6 py-3 glass-button text-white rounded-full font-semibold shadow'
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BlogList
