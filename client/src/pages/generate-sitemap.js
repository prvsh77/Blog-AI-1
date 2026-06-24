import fs from 'fs';
import axios from 'axios';

const VITE_BASE_URL = 'http://localhost:4000'; // Replace with your production API URL
const PUBLIC_URL = 'https://your-blog-url.com'; // Replace with your production frontend URL

async function generateSitemap() {
  try {
    console.log('Fetching blogs for sitemap...');
    const { data } = await axios.get(`${VITE_BASE_URL}/api/blog/all`);

    if (!data.success) {
      throw new Error('Failed to fetch blogs from API');
    }

    const blogs = data.blogs;
    console.log(`Found ${blogs.length} blogs.`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${PUBLIC_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${blogs.map(blog => `
  <url>
    <loc>${PUBLIC_URL}/blog/${blog._id}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('sitemap.xml generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error.message);
  }
}

generateSitemap();