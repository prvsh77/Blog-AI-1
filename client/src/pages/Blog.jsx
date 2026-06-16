import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Moment from 'moment'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Blog = () => {
  const { id } = useParams()
  const { axios } = useAppContext()
  const [data, setData] = useState(null)
  const [comments, setComments] = useState([])
  const [relatedPosts, setRelatedPosts] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setScrollProgress((window.pageYOffset / totalScroll) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [data])

  const fetchBlogData = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/${id}`)
      if (data.success) {
        setData(data.blog)
        fetchRelatedPosts(data.blog.category)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load blog post')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedPosts = async (category) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/related?category=${category}&exclude=${id}`)
      if (data.success) {
        setRelatedPosts(data.posts.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setIsCommentLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/comments`, { blogId: id })
      if (data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load comments')
    } finally {
      setIsCommentLoading(false)
    }
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return
    }
    if (content.trim().length < 10) {
      toast.error('Comment must be at least 10 characters long')
      return
    }
    try {
      setIsCommentLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/add-comment`, { blog: id, name, content })
      if (data.success) {
        toast.success('Comment added for review!')
        setName('')
        setContent('')
        fetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to add comment')
    } finally {
      setIsCommentLoading(false)
    }
  }

  const sharePost = (platform) => {
    const url = window.location.href
    const title = data?.title || 'Check out this blog post!'
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        break
    }
    
    window.open(shareUrl, '_blank')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  useEffect(() => {
    fetchBlogData()
    fetchComments()
  }, [id])

  // Helper to estimate reading time
  const getReadingTime = () => {
    if (!data?.description) return 1
    const text = data.description.replace(/<[^>]*>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.ceil(words / 200) || 1
  }

  // Helper to assign vibrant gradient initial backgrounds for avatars
  const getAvatarBg = (name) => {
    const gradients = [
      'from-red-500 to-pink-600',
      'from-orange-500 to-yellow-600',
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-teal-600',
      'from-emerald-500 to-green-600'
    ]
    const code = name ? name.charCodeAt(0) : 0
    return gradients[code % gradients.length]
  }

  // Helper to normalize and clean category names (fixing DB typos on-the-fly)
  const normalizeCategory = (cat) => {
    if (!cat) return 'Article';
    const trimmed = cat.trim();
    if (trimmed.toLowerCase() === 'artifical intelligence' || trimmed.toLowerCase() === 'artificial intelligence') {
      return 'Artificial Intelligence';
    }
    return trimmed;
  };

  return isLoading ? <Loader /> : data ? (
    <div className="relative min-h-screen bg-transparent pb-8">
      <Navbar />

      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/10 z-[100] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Sticky Share Sidebar */}
      <div className="fixed left-6 xl:left-12 top-[35vh] z-30 flex flex-col gap-4 hidden lg:flex">
        <button 
          onClick={() => sharePost('twitter')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Share on Twitter"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>
        <button 
          onClick={() => sharePost('facebook')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Share on Facebook"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        <button 
          onClick={() => sharePost('linkedin')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>
        <button 
          onClick={copyToClipboard}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          title="Copy Link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>

      {/* Hero Section with Image */}
      <div className="relative w-full h-[65vh] md:h-[75vh] bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover opacity-50 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-end pb-36 md:pb-44">
          <div className="inline-flex flex-wrap items-center gap-2 text-white/95 mb-5 font-semibold text-xs sm:text-sm uppercase tracking-wider bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 w-fit">
            <span>{normalizeCategory(data.category || 'Article')}</span>
            <span className="text-white/40">•</span>
            <span>{Moment(data.createdAt).format('MMM DD, YYYY')}</span>
            <span className="text-white/40">•</span>
            <span className="text-red-300 font-bold">{getReadingTime()} min read</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-md">
            {data.title}
          </h1>
          
          {data.subTitle && (
            <p className="text-lg sm:text-xl text-gray-200/90 mb-8 max-w-3xl leading-relaxed font-medium drop-shadow-sm">
              {data.subTitle}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 p-0.5 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white font-bold">
                  PR
                </div>
              </div>
              <div>
                <p className="text-white font-semibold tracking-wide text-sm sm:text-base">Prashant Rao</p>
                <p className="text-white/60 text-xs sm:text-sm">Content Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Overlay Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-20 pb-16">
        <div className="bg-white border border-gray-100/50 shadow-2xl rounded-3xl p-6 sm:p-12 md:p-16">
          <article>
            <div 
              className="prose prose-lg max-w-none rich-text"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          </article>

          {/* Share Section (Mobile and Bottom widget) */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 font-bold text-sm sm:text-base">Enjoyed this article? Share it:</p>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => sharePost('twitter')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13(10)a1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              
              <button 
                onClick={() => sharePost('facebook')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                onClick={() => sharePost('linkedin')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>

              <button 
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                title="Copy Link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <section className="bg-slate-100/40 border-t border-gray-200/50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>
          
          {/* Add Comment Form */}
          <div className="bg-white border border-gray-200/50 shadow-lg p-6 sm:p-8 mb-10 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Join the conversation</h3>
            <form onSubmit={addComment} className="space-y-4">
              <div>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3.5 glass-input rounded-xl text-gray-950 placeholder-gray-400 outline-none text-sm font-medium border border-gray-200"
                />
              </div>
              <div>
                <textarea
                  onChange={(e) => setContent(e.target.value)}
                  value={content}
                  placeholder="Write a supportive comment..."
                  required
                  rows="4"
                  className="w-full px-4 py-3.5 glass-input rounded-xl resize-none text-gray-955 placeholder-gray-400 outline-none text-sm font-medium border border-gray-200"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCommentLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-103 cursor-pointer"
                >
                  {isCommentLoading ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {isCommentLoading && comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200/50 rounded-2xl shadow-sm">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 font-medium text-sm sm:text-base">No comments yet. Be the first to start the discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((item, index) => (
                <div 
                  key={index} 
                  className="flex gap-4 p-5 bg-white border border-gray-150 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarBg(item.name)} rounded-full flex items-center justify-center flex-shrink-0 shadow`}>
                    <span className="text-white font-bold text-sm">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {Moment(item.createdAt).fromNow()}
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12 tracking-tight">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <a 
                  key={post._id} 
                  href={`/blog/${post._id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-250/60 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 shadow-md">
                    <div className="relative overflow-hidden aspect-video h-[180px]">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold rounded-full tracking-wider uppercase">
                          {normalizeCategory(post.category)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-950 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                        {post.subTitle}
                      </p>
                      <span className="text-red-600 font-bold text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        Read article
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .prose {
          color: #27272a;
          line-height: 1.8;
          font-size: 1.065rem;
          font-family: inherit;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #09090b;
          font-weight: 800;
          margin-top: 1.75em;
          margin-bottom: 0.75em;
          line-height: 1.35;
          letter-spacing: -0.02em;
        }
        
        .prose h1 {
          font-size: 2.25rem;
        }

        .prose h2 {
          font-size: 1.75rem;
          border-bottom: 1px solid #f4f4f5;
          padding-bottom: 0.4em;
        }
        
        .prose h3 {
          font-size: 1.375rem;
        }
        
        .prose p {
          margin-bottom: 1.6em;
        }
        
        .prose a {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1.5px solid rgba(220, 38, 38, 0.15);
          transition: all 0.2s;
        }
        
        .prose a:hover {
          color: #b91c1c;
          border-bottom-color: #b91c1c;
        }
        
        .prose u {
          text-decoration: none;
          border-bottom: 3.5px solid rgba(239, 68, 68, 0.2);
          padding-bottom: 1px;
          display: inline;
          font-weight: 700;
          color: #09090b;
        }

        .prose strong {
          color: #09090b;
          font-weight: 700;
        }

        .prose ul {
          list-style-type: none;
          padding-left: 0.5rem;
          margin: 1.5em 0;
        }
        .prose ul li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose ul li::before {
          content: "•";
          color: #dc2626;
          font-weight: bold;
          font-size: 1.35rem;
          position: absolute;
          left: 0;
          top: -3px;
        }
        
        .prose ol {
          counter-reset: custom-counter;
          list-style-type: none;
          padding-left: 0.5rem;
          margin: 1.5em 0;
        }
        .prose ol li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
          counter-increment: custom-counter;
        }
        .prose ol li::before {
          content: counter(custom-counter) ".";
          color: #dc2626;
          font-weight: 700;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .prose li {
          margin-bottom: 0.6em;
          line-height: 1.75;
        }
        
        .prose blockquote {
          border-left: 4px solid #dc2626;
          background-color: #fff5f5;
          padding: 1.25rem 1.75rem;
          margin: 2rem 0;
          border-radius: 0 0.75rem 0.75rem 0;
          font-style: italic;
          color: #4b5563;
        }
        
        .prose img {
          border-radius: 1rem;
          margin: 2.5em 0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        
        .prose code {
          background-color: #f4f4f5;
          padding: 0.2em 0.4em;
          border-radius: 0.375rem;
          font-size: 0.875em;
          color: #dc2626;
          font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-weight: 600;
        }
        
        .prose pre {
          background-color: #0f172a;
          color: #f1f5f9;
          padding: 1.5em;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2em 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          font-weight: inherit;
        }
      `}</style>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-xl">Blog post not found</p>
      </div>
    </div>
  )
}

export default Blog