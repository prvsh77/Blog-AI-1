import React from 'react'
import { assets, footer_data } from '../assets/assets'

const Footer = () => {
  return (
    <footer className='px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50/80 border-t border-gray-200/50 backdrop-blur-md'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-12 py-12 border-b border-gray-200 text-gray-500'>

        <div className='flex flex-col max-w-[420px]'>
            <img src={assets.logo} alt="logo" className='w-32 sm:w-44 mb-6 hover:opacity-85 transition cursor-pointer'/>
            <p className='text-sm leading-relaxed text-gray-500'>
              PrashBlog is an AI-powered publishing platform for creators, builders, and thinkers. Write without limits, brainstorm with Gemini, and share stories that reshape ideas in technology, startup ecosystems, and lifestyles.
            </p>
        </div>

        <div className='flex flex-wrap justify-between w-full md:w-[50%] gap-8'>
            {footer_data.map((section, index)=> (
                <div key={index} className='min-w-[120px]'>
                    <h4 className='font-bold text-sm text-gray-900 mb-4 tracking-wider uppercase'>{section.title}</h4>
                    <ul className='text-sm space-y-2.5'>
                        {section.links.map((link, i)=> (
                            <li key={i}>
                                <a href="#" className='hover:text-red-600 text-gray-500 font-medium transition-colors duration-250'>{link}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

      </div>
      <p className='py-6 text-center text-xs sm:text-sm text-gray-500 font-medium'>
        Copyright {new Date().getFullYear()} © PrashBlog. Powered by Google Gemini. All Rights Reserved.
      </p>
    </footer>
  )
}

export default Footer
