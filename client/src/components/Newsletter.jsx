import React from 'react'
import toast from 'react-hot-toast'

const Newsletter = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Successfully subscribed to our newsletter!')
  }

  return (
    <div className='flex flex-col items-center justify-center text-center space-y-3 my-32 max-w-4xl mx-auto px-6'>
      <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-600 text-[11px] font-bold rounded-full uppercase tracking-wider mb-2'>
        Stay Updated
      </div>
      <h2 className='md:text-4xl text-3xl font-extrabold tracking-tight text-gray-900'>Never Miss an Update!</h2>
      <p className='md:text-lg text-gray-500 max-w-xl pb-6 leading-relaxed'>
        Subscribe to get the latest posts, modern web technologies insights, and exclusive content delivered directly to your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row items-stretch justify-center max-w-md w-full gap-2 sm:gap-0 bg-white/40 backdrop-blur-md p-1.5 border border-gray-200/50 rounded-2xl sm:rounded-full shadow-lg focus-within:border-red-500/40 focus-within:ring-4 focus-within:ring-red-500/5 transition-all duration-300'>
        <input 
          className='bg-transparent h-12 w-full px-5 text-gray-800 font-medium placeholder-gray-400 outline-none text-sm' 
          type="email" 
          placeholder='Enter your email address' 
          required
        />
        <button 
          type='submit' 
          className='bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 h-12 rounded-xl sm:rounded-full font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-103 text-sm flex-shrink-0'
        >
          Subscribe
        </button>
      </form>
    </div>
  )
}

export default Newsletter
