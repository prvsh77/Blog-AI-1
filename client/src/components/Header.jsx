import React, { useRef } from 'react'
import { useAppContext } from '../context/AppContext'

const Header = () => {

  const {setInput, input} = useAppContext()
  const inputRef = useRef()

  const onSubmitHandler = async (e)=>{
     e.preventDefault();
     setInput(inputRef.current.value)
  }

  const onClear = ()=>{
    setInput('')
    inputRef.current.value = ''
  }

  return (
    <div className='relative overflow-hidden bg-transparent'>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ef4444 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative'>
        <div className='text-center pt-20 pb-16'>

          {/* Badge */}
          <div className='inline-flex items-center gap-3 px-5 py-2.5 mb-8 border border-red-200/60 bg-white/60 backdrop-blur-lg rounded-full text-xs sm:text-sm text-red-700 font-semibold shadow-md transition-all hover:scale-105 duration-300'>
            <span className='relative flex h-2.5 w-2.5'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500'></span>
            </span>
            <p className="tracking-wide uppercase text-[11px] sm:text-xs">AI-Powered Blogging Platform</p>
          </div>

          {/* Main Heading */}
          <h1 className='text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight'>
            <span className='text-gray-900'>Your own</span>
            {' '}
            <span className='bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 bg-clip-text text-transparent'>blogging</span>
            {' '}
            <span className='text-gray-900'>space</span>
          </h1>

          {/* Subheading */}
          <p className='text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed'>
            A premium canvas to think out loud, share what matters, and build stories without filters. Powered by Gemini.
          </p>

          {/* Search Bar */}
          <div className='max-w-2xl mx-auto mb-4'>
            <form onSubmit={onSubmitHandler} className='relative group'>
              <div className='relative flex items-center bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg group-hover:shadow-xl group-focus-within:border-red-500/40 group-focus-within:ring-4 group-focus-within:ring-red-500/10 transition-all duration-300'>
                <div className='pl-6 text-gray-400'>
                  <svg className='w-5 h-5 transition-colors group-focus-within:text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
                <input 
                  ref={inputRef} 
                  type="text" 
                  placeholder='Search articles, topics, or categories...' 
                  required 
                  className='w-full py-4 px-4 outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base'
                />
                <button 
                  type="submit" 
                  className='bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 m-1.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer'
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Clear Button */}
          {input && (
            <button 
              onClick={onClear} 
              className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors duration-200'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.2} d='M6 18L18 6M6 6l12 12' />
              </svg>
              Clear search
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default Header