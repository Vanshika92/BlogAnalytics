const express = require('express');
const request = require('request');
const _ = require('lodash');
const memoize = require('lodash.memoize');

const app = express();
const PORT = 3000; // You can change the port number
const API_URL = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const ADMIN_SECRET = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

// Define a function to fetch and analyze blog data
const fetchAndAnalyzeBlogData = (callback) => {
  const curlOptions = {
    url: API_URL,
    method: 'GET',
    headers: {
      'x-hasura-admin-secret': ADMIN_SECRET,
    },
  };

  // Make the curl request to fetch blog data
  request(curlOptions, (error, response, body) => {
    if (error) {
      console.error('Error fetching blog data:', error);
      callback({ error: 'Internal Server Error' });
    } else {
      // Parse the JSON response
      const blogData = JSON.parse(body);

      // Calculate analytics using Lodash
      const totalBlogs = blogData.length;
      const longestBlog = _.maxBy(blogData, (blog) => blog.title.length);
      const blogsContainingPrivacy = _.filter(blogData, (blog) =>
        blog.title.toLowerCase().includes('privacy')
      );
      const uniqueBlogTitles = _.uniqBy(blogData, 'title');

      // Construct and return the result object
      const result = {
        totalBlogs,
        longestBlogTitle: longestBlog.title,
        blogsContainingPrivacy: blogsContainingPrivacy.length,
        uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
      };

      callback(null, result);
    }
  });
};

// Memoize the fetchAndAnalyzeBlogData function with a cache key generator
const memoizedFetchAndAnalyze = memoize(fetchAndAnalyzeBlogData, () => 'blogDataCacheKey');

// Middleware to handle /api/blog-stats
app.get('/api/blog-stats', (req, res) => {
  // Use the memoized function to get the data
  memoizedFetchAndAnalyze((error, result) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(result);
    }
  });
});

// ... Rest of your code remains the same for the blog search endpoint and error handling

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
