import axios from "axios";
import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import {parse} from 'marked'

import Loader from '../../components/Loader'

// Helper to normalize category name spelling
const normalizeCategory = (cat) => {
  if (!cat) return 'Article';
  const trimmed = cat.trim();
  if (trimmed.toLowerCase() === 'artifical intelligence' || trimmed.toLowerCase() === 'artificial intelligence') {
    return 'Artificial Intelligence';
  }
  return trimmed;
};

const AddBlog = () => {

    const {axios} = useAppContext()
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [topicsloading,setTopicsLoading] = useState(false)

    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const [blogTopics, setBlogTopics] = useState([])

    const [image, setImage] = useState(false);
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [category, setCategory] = useState('Technology');
    const [isPublished, setIsPublished] = useState(false);

    const generateContent = async ()=>{
        if(!title) return toast.error('Please enter a title')

        try {
            setLoading(true);
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/generate`, {prompt: title})
            if (data.success){
                quillRef.current.root.innerHTML = parse(data.content)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }

    const generateTopics = async ()=>{

        try {
            setTopicsLoading(true);
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/give-topics`)
            console.log(data)
            if (data.success){
                setBlogTopics(data.topics)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }finally{
            setTopicsLoading(false)
        }
    }
const cleanTitle = (rawTitle) => {
    if (!rawTitle) return '';

    // If array → take first item
    if (Array.isArray(rawTitle)) {
        return rawTitle[0].replace(/^"+|"+$/g, '').trim();
    }

    // If string with commas & quotes
    return rawTitle
        .split(',')[0]          // take first title
        .replace(/^"+|"+$/g, '') // remove surrounding quotes
        .trim();
};
    const onSubmitHandler = async (e) =>{
        try {
            e.preventDefault();
            setIsAdding(true)

            const blog = {
                title, subTitle, 
                description: quillRef.current.root.innerHTML,
                category, isPublished
            }

            const formData = new FormData();
            formData.append('blog', JSON.stringify(blog))
            if (image) {
                formData.append('image', image)
            }

            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/add`, formData);

            if(data.success){
                toast.success(data.message);
                setImage(false)
                setTitle('')
                setSubTitle('')
                quillRef.current.root.innerHTML = ''
                setCategory('Technology')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }finally{
            setIsAdding(false)
        }
        
    }

    useEffect(()=>{
        // Initiate Quill only once
        if(!quillRef.current && editorRef.current){
            quillRef.current = new Quill(editorRef.current, {theme: 'snow'})
        }
    },[])

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 bg-gradient-to-br from-red-50/20 via-slate-50 to-slate-50 text-gray-700 h-full overflow-scroll pb-16'>
      <div className='max-w-3xl p-6 sm:p-10 md:m-8 bg-white border border-gray-200/50 shadow-xl rounded-2xl'>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Create New Post</h2>

        <p className='font-semibold text-sm text-gray-800 mb-2'>Upload thumbnail</p>
        <label htmlFor="image" className="block w-full max-w-lg">
            {!image ? (
              <div className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-red-500/40 bg-gray-50/50 hover:bg-red-50/10 rounded-xl p-6 transition-all duration-300 cursor-pointer text-center group'>
                <img src={assets.upload_area} alt="upload" className='h-10 w-10 mb-3 opacity-60 group-hover:scale-105 transition duration-200' />
                <p className='text-xs font-semibold text-gray-600'>Drag & drop or click to upload</p>
                <p className='text-[10px] text-gray-400 mt-1 uppercase'>PNG, JPG, WEBP (Ratio 16:9)</p>
              </div>
            ) : (
              <div className="relative group w-full max-w-lg rounded-xl overflow-hidden shadow-md">
                <img src={URL.createObjectURL(image)} alt="preview" className='w-full aspect-video object-cover max-h-52'/>
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                  <span className="bg-white/95 px-4 py-2 rounded-full text-xs font-bold text-gray-800 shadow cursor-pointer">Change Image</span>
                </div>
              </div>
            )}
            <input onChange={(e)=> setImage(e.target.files[0] || null)} type="file" id='image' hidden />
        </label>

       <div className="mt-6">
    <button 
        type="button"
        onClick={generateTopics}
        disabled={topicsloading}
        className={`inline-flex items-center mb-3 cursor-pointer gap-2 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-103 ${topicsloading ? 'opacity-90 cursor-not-allowed' : ''}`}
    >
        {topicsloading && (
            <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-white rounded-full animate-spin"></span>
        )}
        <span>{topicsloading ? 'Generating topics…' : 'Brainstorm Topics with Gemini'}</span>
    </button>

    {topicsloading && (
        <div className="mt-3 space-y-2 max-w-lg">
            <div className="h-12 rounded-xl bg-gray-200 animate-pulse"></div>
            <div className="h-12 rounded-xl bg-gray-200 animate-pulse"></div>
            <div className="h-12 rounded-xl bg-gray-200 animate-pulse"></div>
        </div>
    )}

    {blogTopics.length > 0 && (
      <div className="max-w-lg mb-4 bg-slate-50 border border-gray-150 p-4 rounded-xl space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Gemini Suggestions (Click to fill):</p>
        {blogTopics.map((topic, index) => {
          const title = cleanTitle(topic.title);
          const normalizedCat = normalizeCategory(topic.category);

          return (
              <div
                  key={index}
                  className="cursor-pointer p-3 rounded-xl border border-gray-200 bg-white hover:border-red-500/40 hover:shadow-sm transition duration-200 flex items-center justify-between gap-3"
                  onClick={() => {
                      setTitle(title);
                      setCategory(normalizedCat);
                  }}
              >
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-snug">
                      {title}
                  </p>

                  {topic.category && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 font-bold flex-shrink-0">
                          {normalizedCat}
                      </span>
                  )}
              </div>
          );
        })}
      </div>
    )}

</div>
        <p className='font-semibold text-sm text-gray-800 mt-5'>Blog title</p>
        <input type="text" placeholder='Type an inspiring blog title...' required className='w-full max-w-lg mt-2 p-3 bg-white border border-gray-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none font-medium transition-all duration-300 text-sm' onChange={e => setTitle(e.target.value)} value={title}/>

        <p className='font-semibold text-sm text-gray-800 mt-5'>Sub title</p>
        <input type="text" placeholder='Brief summary/subtitle...' required className='w-full max-w-lg mt-2 p-3 bg-white border border-gray-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none font-medium transition-all duration-300 text-sm' onChange={e => setSubTitle(e.target.value)} value={subTitle}/>

        <p className='font-semibold text-sm text-gray-800 mt-5'>Blog Description</p>
        <div className='max-w-lg h-80 pb-16 sm:pb-12 pt-2 relative'>
            <div ref={editorRef} className="rounded-xl border border-gray-200 bg-white min-h-[160px]"></div>
            {loading && ( 
            <div className='absolute inset-x-0 top-2 bottom-12 flex items-center justify-center bg-white/60 z-10 rounded-xl border border-gray-200/50'>
                <div className='w-8 h-8 rounded-full border-3 border-red-500 border-t-transparent animate-spin'></div>
            </div> )}
            <button disabled={loading} type='button' onClick={generateContent} className='absolute bottom-2.5 right-2 text-xs font-semibold text-white bg-slate-900 hover:bg-red-600 px-4.5 py-2 rounded-lg transition-all duration-300 shadow cursor-pointer'>
              Auto-generate with AI
            </button>
        </div>

        <p className='font-semibold text-sm text-gray-800 mt-5'>Blog category</p>
        <select onChange={e => setCategory(normalizeCategory(e.target.value))} value={normalizeCategory(category)} name="category" className='mt-2 px-4.5 py-3 bg-white border border-gray-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 text-gray-700 font-semibold rounded-xl outline-none transition-all duration-300 text-sm'>
            {blogCategories.filter(cat => cat !== 'All').map((item, index)=>{
                const normalized = normalizeCategory(item);
                return <option key={index} value={normalized}>{normalized}</option>
            })}
        </select>

        <div className='flex items-center gap-3 mt-6'>
            <p className='font-semibold text-sm text-gray-800'>Publish Now</p>
            <input type="checkbox" checked={isPublished} className='scale-125 cursor-pointer accent-red-600' onChange={e => setIsPublished(e.target.checked)}/>
        </div>

        <button disabled={isAdding} type="submit" className='mt-8 w-44 h-12 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-103 cursor-pointer'>
            {isAdding ? 'Adding Blog...' : 'Create Post'}
        </button>

      </div>
    </form>
  )
}

export default AddBlog
