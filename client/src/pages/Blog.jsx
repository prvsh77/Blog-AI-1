import axios from "axios";
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Moment from 'moment'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import { getCategoryImage } from '../assets/assets'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import debounce from 'lodash.debounce';

const Blog = () => {
  const { slug } = useParams()
  const { blogs } = useAppContext()
  const [data, setData] = useState(null)
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef(null);
  const [comments, setComments] = useState([])
  const [relatedPosts, setRelatedPosts] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false);


  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setScrollProgress((window.pageYOffset / totalScroll) * 100)
      }
      if (window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [data])

  // TOC & Active Heading Logic
  useEffect(() => {
    if (!contentRef.current) return;

    const handleScroll = debounce(() => {
      const headingElements = contentRef.current.querySelectorAll('h1, h2, h3');
      let current = '';
      headingElements.forEach(heading => {
        const headingTop = heading.getBoundingClientRect().top;
        if (headingTop < window.innerHeight / 2) {
          current = heading.id;
        }
      });
      setActiveHeading(current);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleTocClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Adjust for fixed navbar height
      window.scrollTo({ top: element.offsetTop - offset, behavior: 'smooth' });
    }
  };

  const fetchBlogData = async () => {
    try {
      setIsLoading(true)
      console.log("Current slug:", slug);
      console.log("Request URL:", `${import.meta.env.VITE_BASE_URL}/api/blog/${slug}`);
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/${slug}`)
      if (data.success) {
        setData(data.blog)
        fetchRelatedPosts(data.blog.category, data.blog._id)
        fetchComments(data.blog._id)
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

  const fetchRelatedPosts = async (category, excludeId) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/related?category=${category}&exclude=${excludeId}`)
      if (data.success) {
        setRelatedPosts(data.posts.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  const fetchComments = async (blogId) => {
    try {
      setIsCommentLoading(true)
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/comments`, { blogId })
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
      const { data: resData } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/blog/add-comment`, { blog: data._id, name, content })
      if (resData.success) {
        toast.success('Comment added for review!')
        setName('')
        setContent('')
        fetchComments(data._id)
      } else {
        toast.error(resData.message)
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
    if (slug) {
      fetchBlogData()
    }
  }, [slug])

  // Article Navigation
  const { prevArticle, nextArticle } = useMemo(() => {
    if (!data || !blogs || blogs.length === 0) {
      return { prevArticle: null, nextArticle: null };
    }
    const currentIndex = blogs.findIndex(blog => blog._id === data._id);
    if (currentIndex === -1) {
      return { prevArticle: null, nextArticle: null };
    }
    const prev = currentIndex > 0 ? blogs[currentIndex - 1] : null;
    const next = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;
    return { prevArticle: prev, nextArticle: next };
  }, [data, blogs]);

  // Copy Code Button
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  // Fallback Content Generation
  // Determine fallback content
  const hasContent = data && data.description && data.description.replace(/<[^>]*>/g, '').trim().length > 10;
  const displayDescription = data ? (hasContent ? data.description : `
    <h2>Introduction</h2>
    <p>Welcome to our deep dive into <strong>${data.title}</strong>. In the evolving landscape of ${data.category || 'our industry'}, understanding the core principles of this subject has become increasingly vital for professionals and enthusiasts alike. This article explores the foundational aspects and why it matters today.</p>
    
    <h2>Main Section: Exploring the Core</h2>
    <p>When analyzing ${data.title}, we find several key layers that contribute to its growth and impact. From its initial development to its modern applications, this topic touches upon critical workflows, strategic choices, and technological advancements. As we look closer, we see how standard methodologies are shifting to accommodate more efficient, streamlined practices.</p>
    
    <h2>Key Insights</h2>
    <ul>
      <li><strong>Strategic Importance:</strong> Staying updated with trends in ${data.category || 'this field'} helps maintain a competitive edge.</li>
      <li><strong>Practical Application:</strong> Implementing these concepts requires consistent execution and refinement.</li>
      <li><strong>Future Outlook:</strong> The trajectory of ${data.title} indicates long-term growth and new opportunities for innovation.</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>We believe that understanding ${data.title} is key to navigating the future of ${data.category || 'related fields'}. By staying curious and applying these insights, we can better adapt to upcoming developments. We look forward to seeing how this space evolves in the coming months.</p>
  `) : '';

  // TOC Generation
  useEffect(() => {
    if (!displayDescription) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = displayDescription;
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3');
    const extractedHeadings = Array.from(headingElements).map((heading, index) => {
      const id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      heading.id = id; // Add id to the element itself for scrolling
      return {
        id,
        text: heading.textContent,
        level: parseInt(heading.tagName.substring(1), 10)
      };
    });
    setHeadings(extractedHeadings);
  }, [displayDescription]);

  // Helper to estimate reading time
  const getReadingTime = useCallback(() => {
    if (!displayDescription) return 1
    const text = displayDescription.replace(/<[^>]*>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.ceil(words / 200) || 1
  }, [displayDescription]);

  // Memoize the parsed description to avoid re-parsing on every render
  const parsedDescription = useMemo(() => {
    if (!displayDescription) return null;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = displayDescription;
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3');
    headingElements.forEach(heading => {
      const id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      heading.id = id;
    });
    return <div dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }} />;
  }, [displayDescription]);

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

  const coverImage = data ? data.image || getCategoryImage(data.category) : '';

  return isLoading ? <Loader /> : data ? (
    <div className="relative min-h-screen bg-transparent pb-8">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{`${data.title} | Blog-AI`}</title>
        <meta name="description" content={data.subTitle || displayDescription.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <link rel="canonical" href={window.location.href} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.subTitle || displayDescription.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:site_name" content="Blog-AI" />
        <meta property="article:published_time" content={data.createdAt} />
        <meta property="article:author" content="Prashant Rao" />
        <meta property="article:section" content={data.category} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.subTitle || displayDescription.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta name="twitter:image" content={coverImage} />
      </Helmet>

      <Navbar />

      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/10 z-[100] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}


      {/* Desktop Sticky Share Sidebar */}
      <div className="fixed left-6 xl:left-12 top-[35vh] z-30 flex flex-col gap-4 hidden lg:flex">
        <button 
          onClick={() => sharePost('twitter')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Share on Twitter"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.63 0-4.5 2.24-3.91 4.79A12.94 12.94 0 013 4s-4 9 5 13a13.28 13.28 0 01-8 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
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
          onClick={() => sharePost('whatsapp')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 border border-gray-200/80 shadow-md text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.48 1.34 5l-1.48 5.45 5.58-1.45c1.45.81 3.09 1.24 4.78 1.24h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12 20.15c-1.48 0-2.91-.4-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32A8.08 8.08 0 014.03 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zM17.43 14.48c-.22-.11-.83-.41-1.03-.46-.2-.05-.34-.08-.49.08-.15.16-.55.69-.67.83-.13.14-.25.16-.47.05-.22-.11-1.25-.46-2.38-1.47-1.13-1.01-1.6-1.89-1.79-2.23-.19-.34-.02-.52.09-.62.1-.1.22-.26.33-.39.11-.13.15-.22.23-.37.08-.15.04-.28-.02-.38-.06-.1-.55-1.32-.75-1.82-.2-.49-.4-.43-.55-.43h-.48c-.15 0-.39.04-.59.23-.2.19-.78.76-.78 1.85s.8 2.14.91 2.3.78 2.39 3.29 3.25c2.51.86 2.51.57 2.96.52.45-.05 1.32-.54 1.51-1.05.19-.51.19-.95.13-1.05s-.22-.16-.43-.27z"/>
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

      {/* Hero Section with Category Image */}
      <div className="relative w-full h-[65vh] md:h-[75vh] bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={coverImage} 
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-20 pb-16 flex items-start gap-12">
        {/* Table of Contents */}
        <aside className="hidden xl:block w-64 sticky top-24 flex-shrink-0">
          <div className="p-4 bg-white/50 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-sm">
            <h4 className="font-bold text-sm text-gray-800 mb-3">Table of Contents</h4>
            <ul className="space-y-2 text-sm">
              {headings.map(heading => (
                <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => { e.preventDefault(); handleTocClick(heading.id); }}
                    className={`block py-1 px-2 rounded-md transition-all duration-200 ${
                      activeHeading === heading.id
                        ? 'bg-red-100 text-red-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-grow bg-white border border-gray-100/50 shadow-2xl rounded-3xl p-6 sm:p-12 md:p-16 min-w-0">
          <article ref={contentRef}>
            <div className="prose prose-lg max-w-none rich-text">
              {parsedDescription}
            </div>
          </article>

          {/* Article Navigation */}
          <div className="mt-16 flex justify-between border-t border-gray-200 pt-8">
            {prevArticle ? (
              <Link to={`/blog/${prevArticle._id}`} className="text-left">
                <p className="text-sm text-gray-500">Previous Article</p>
                <p className="font-semibold text-red-600 hover:underline">{prevArticle.title}</p>
              </Link>
            ) : <div />}
            {nextArticle ? (
              <Link to={`/blog/${nextArticle._id}`} className="text-right">
                <p className="text-sm text-gray-500">Next Article</p>
                <p className="font-semibold text-red-600 hover:underline">{nextArticle.title}</p>
              </Link>
            ) : <div />}
          </div>

          {/* Author Section */}
          <div className="mt-12 p-6 sm:p-8 bg-slate-50 border border-gray-150 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 p-0.5 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                PR
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Posted by Prashant Rao</p>
              <h4 className="text-lg font-bold text-gray-900">Prashant Rao</h4>
              <p className="text-gray-655 text-sm mt-1 leading-relaxed">
                AI Engineer | Machine Learning Enthusiast | Full-Stack Developer
              </p>
            </div>
          </div>

          {/* Share Section (Mobile and Bottom widget) */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 font-bold text-sm sm:text-base">Enjoyed this article? Share it:</p>
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => sharePost('twitter')} 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.5 3c-2.63 0-4.5 2.24-3.91 4.79A12.94 12.94 0 013 4s-4 9 5 13a13.28 13.28 0 01-8 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
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
                onClick={() => sharePost('whatsapp')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.74.45 3.48 1.34 5l-1.48 5.45 5.58-1.45c1.45.81 3.09 1.24 4.78 1.24h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM12 20.15c-1.48 0-2.91-.4-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32A8.08 8.08 0 014.03 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zM17.43 14.48c-.22-.11-.83-.41-1.03-.46-.2-.05-.34-.08-.49.08-.15.16-.55.69-.67.83-.13.14-.25.16-.47.05-.22-.11-1.25-.46-2.38-1.47-1.13-1.01-1.6-1.89-1.79-2.23-.19-.34-.02-.52.09-.62.1-.1.22-.26.33-.39.11-.13.15-.22.23-.37.08-.15.04-.28-.02-.38-.06-.1-.55-1.32-.75-1.82-.2-.49-.4-.43-.55-.43h-.48c-.15 0-.39.04-.59.23-.2.19-.78.76-.78 1.85s.8 2.14.91 2.3.78 2.39 3.29 3.25c2.51.86 2.51.57 2.96.52.45-.05 1.32-.54 1.51-1.05.19-.51.19-.95.13-1.05s-.22-.16-.43-.27z"/>
                </svg>
                WhatsApp
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
                  className="w-full px-4 py-3.5 glass-input rounded-xl text-gray-955 placeholder-gray-400 outline-none text-sm font-medium border border-gray-200"
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12 tracking-tight text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => {
                const relatedSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const relatedCover = post.image || getCategoryImage(post.category);
                return (
                  <Link 
                    key={post._id} 
                    to={`/blog/${post._id}`}
                    className="group"
                  >
                    <div className="bg-white border border-gray-250/60 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 shadow-md flex flex-col h-full">
                      <div className="relative overflow-hidden aspect-video h-[180px]">
                        <img 
                          src={relatedCover} 
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
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-950 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                            {post.subTitle}
                          </p>
                        </div>
                        <span className="text-red-600 font-bold text-xs inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                          Read article
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      
      <style>{`
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

      {/* Syntax Highlighting Component */}
      <div style={{ display: 'none' }}>
        <SyntaxHighlighter language="javascript" style={oneDark} PreTag="div">
          {`
            // This is a dummy component to ensure styles are loaded
            // for dynamically rendered code blocks.
            function hello() { console.log('world'); }
          `}
        </SyntaxHighlighter>
      </div>

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