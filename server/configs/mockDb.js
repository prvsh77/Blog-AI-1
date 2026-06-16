// filepath: server/configs/mockDb.js
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db_fallback.json');

// Helper to initialize and read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        blogs: [
          {
            _id: 'blog_1',
            title: 'Unlocking Creative Writing with AI-Assisted Workflows',
            subTitle: 'How prompt engineering is changing the landscape of journalism and creative writing.',
            description: '<h1>Unlocking Creative Writing with AI</h1><p>Artificial Intelligence is no longer just a futuristic concept; it is actively shaping how we communicate, work, and write. In this article, we explore the convergence of human creativity and machine intelligence, showing how creators can leverage AI to brainstorm topics, construct outlines, and generate draft sections while preserving their unique voice.</p><h2>The Collaboration Paradigm</h2><p>Rather than replacing human authors, the best AI tools act as collaborative partners. They help overcome writer\'s block, propose synonyms, and restructure complex arguments.</p>',
            category: 'Technology',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            _id: 'blog_2',
            title: 'Navigating the Rise of Micro-SaaS Startups in 2026',
            subTitle: 'Why building a highly focused software tool is the best way to bootstrap your business.',
            description: '<h1>The Rise of Micro-SaaS</h1><p>The startup landscape has shifted. Developers and entrepreneurs are finding immense success by targeting niche markets with hyper-focused software products. These businesses are often run by solo founders or small teams with low overhead, allowing for rapid profitability and high customer satisfaction.</p>',
            category: 'Startups',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
          },
          {
            _id: 'blog_ai_card',
            title: 'Artificial Intelligence: The Foundational Frontier',
            subTitle: 'How AI is shaping modern industries, economies, and collaborative systems.',
            description: '<h1>Artificial Intelligence: The Foundational Frontier</h1><p>Artificial Intelligence (AI) is a foundational technology shaping industries, economies, and everyday life. From virtual assistants to advanced data analytics, AI enables machines to simulate human intelligence, including learning, reasoning, and decision-making.</p><h2>The Evolution of Thinking Machines</h2><p>But how did we get here? Well, the invention of AI was not a single breakthrough, but rather the result of decades of ideas, experimentation, and technological progress. In recent years, AI has transitioned from academic curiosity to a core computing paradigm, changing how software is developed, designed, and interacted with.</p><h2>Key Pillars of Modern AI</h2><ul><li><strong>Machine Learning:</strong> Feeding algorithms vast datasets to recognize complex patterns and predict outcomes.</li><li><strong>Neural Networks:</strong> Computational nodes modeled loosely on human biological brains to process high-dimensional information.</li><li><strong>Generative Models:</strong> Systems capable of creating new text, code, imagery, or audio that collaborates directly with human intelligence.</li></ul><p>Ultimately, AI is a tool to expand human capability, helping solve problems in healthcare, climate modeling, productivity, and artistic creation. Understanding its foundations is key for builders looking to shape tomorrow.</p>',
            category: 'Artificial Intelligence',
            image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '6810a6a2ed57ecc68a99abb3',
            title: 'AI best practices in healthcare',
            subTitle: 'Navigating the Future Responsibly',
            description: '<h2>AI Best Practices in Healthcare: Navigating the Future Responsibly</h2><p>\n</p><p>Artificial Intelligence (AI) is rapidly transforming healthcare, promising to revolutionize everything from diagnosis and treatment to patient care and operational efficiency. But with great power comes great responsibility. To harness the full potential of AI in healthcare while mitigating risks, we need to adopt a set of best practices that prioritize patient safety, ethical considerations, and responsible innovation.</p><p>\n</p><p>This blog post explores key AI best practices in healthcare, offering a roadmap for organizations looking to integrate AI solutions effectively and ethically.</p><p>\n</p><p><strong>1. Prioritize Patient Safety and Well-being Above All Else:</strong></p><p>\n</p><p>This is the golden rule of AI in healthcare. Any AI application must be rigorously tested and validated to ensure it enhances, not hinders, patient care.</p><p>\n</p><p>\n</p><p><strong>2. Embrace Transparency and Explainability (XAI):</strong></p><p>\n</p><p>\"Black box\" AI can erode trust and make it difficult to understand how decisions are made. Strive for transparency and explainability in your AI solutions.</p><p>\n</p><p>\n</p><p><strong>3. Address Bias and Ensure Fairness:</strong></p><p>\n</p><p>AI models are trained on data, and if that data reflects existing biases in the healthcare system, the AI will perpetuate and potentially amplify those biases.</p><p>\n</p><p>\n</p><p><strong>4. Secure Patient Data and Protect Privacy:</strong></p><p>\n</p><p>Data security and patient privacy are paramount. AI systems must comply with all applicable regulations and protect sensitive patient information.</p><p>\n</p><p>\n</p><p><strong>5. Foster Collaboration and Continuous Learning:</strong></p><p>\n</p><p>AI development in healthcare is a collaborative effort.  Break down silos and encourage knowledge sharing among stakeholders.</p><p>\n\n</p><p><strong>6. Define Clear Roles and Responsibilities:</strong></p><p>\n</p><p>Clearly define the roles and responsibilities of each stakeholder involved in AI development and deployment.</p><p>\n</p><p><br></p><p>\n</p><p><strong>Conclusion: Embracing a Future of Responsible AI in Healthcare</strong></p><p>\n</p><p>AI holds immense potential to transform healthcare for the better. By embracing these best practices, healthcare organizations can navigate the complexities of AI integration responsibly, ensuring patient safety, ethical considerations, and data privacy are at the forefront.  As AI continues to evolve, a commitment to continuous learning and adaptation will be crucial to unlocking its full potential and building a future where AI empowers healthcare professionals to deliver the best possible care to patients.</p><p>\n</p><p><strong>What are your thoughts? What other best practices do you think are essential for AI in healthcare? Share your opinions in the comments below!</strong></p><p>\n</p>',
            category: 'Artificial Intelligence',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'blog_finance_card',
            title: 'Personal Finance: Building Wealth in the Digital Age',
            subTitle: "A beginner's guide to budgeting, investing, and achieving financial independence.",
            description: "<h1>Personal Finance in the Digital Age</h1><p>Managing money effectively is one of the most critical skills in life, yet it is rarely taught in schools. In the digital age, we have more tools than ever to track spending, automate savings, and invest in global markets. However, the fundamentals of personal finance remain unchanged: spend less than you earn, invest the difference, and plan for the long term.</p><h2>The Core Pillars of Wealth Building</h2><ul><li><strong>Budgeting:</strong> Tracking your income and expenses to understand where your money goes.</li><li><strong>Emergency Fund:</strong> Saving 3 to 6 months of living expenses for unexpected events.</li><li><strong>Debt Management:</strong> Prioritizing high-interest debt repayment to free up future cash flow.</li><li><strong>Investing:</strong> Utilizing compound interest through low-cost index funds and long-term retirement accounts.</li></ul><p>By starting small and maintaining consistency, anyone can build a secure financial foundation and work toward ultimate financial freedom.</p>",
            category: 'Finance',
            image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'blog_lifestyle_card',
            title: 'A Simple Step-by-Step Guide to Managing Your Lifestyle',
            subTitle: "How to balance health, productivity, relationships, and routines for a fulfilling life.",
            description: "<h1>A Simple Step-by-Step Guide to Managing Your Lifestyle</h1><p>If you're looking to improve your health, boost productivity, and create a balanced life, managing your lifestyle intentionally is key. Here's a short guide to help you take control of your daily habits and overall well-being.</p><h2>1. Assess Your Current Lifestyle</h2><p>Track your habits for a week. Note your energy levels, sleep, diet, and daily routines. Reflect on what's working and what needs change.</p><h2>2. Focus on Health</h2><p>Eat balanced meals, stay hydrated, get enough sleep, and move your body daily. Mental health matters too—set boundaries and practice mindfulness.</p><h2>3. Set Clear Goals</h2><p>Break your goals into categories like health, career, and relationships. Make them specific and achievable.</p><h2>4. Create Daily Routines</h2><p>Establish morning and evening routines. Plan your days and weeks with intention using a planner or digital calendar.</p><h2>5. Manage Time Wisely</h2><p>Prioritize important tasks, limit distractions, and take regular breaks. Learn to say no when needed.</p><h2>6. Handle Finances Smartly</h2><p>Track your spending, set a budget, save regularly, and build financial literacy. Financial stability supports overall peace of mind.</p><h2>7. Build Strong Relationships</h2><p>Surround yourself with supportive people. Communicate openly and maintain healthy boundaries.</p><h2>8. Keep Learning</h2><p>Read, take online courses, or explore new hobbies. Personal growth keeps life fulfilling and dynamic.</p><h2>9. Declutter Regularly</h2><p>Simplify your physical and digital spaces. Clear surroundings help reduce stress and increase focus.</p><h2>10. Celebrate Small Wins</h2><p>Track your progress, reflect often, and reward yourself for sticking to positive habits. Consistency is more important than perfection.</p><p><strong>Final Tip</strong>: Start small, stay consistent, and review your lifestyle regularly. With steady effort, a well-managed life becomes a natural way of living.</p>",
            category: 'Lifestyle',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1280&q=80',
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        comments: [
          {
            _id: 'comment_1',
            blog: 'blog_1',
            name: 'Sarah Connor',
            content: 'This is an excellent overview. Collaborative AI has really helped my blogging workflow!',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading fallback JSON database:', err);
    return { blogs: [], comments: [] };
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback JSON database:', err);
  }
}

class MockQuery {
  constructor(data, populateFn = null) {
    this.data = data;
    this.populateFn = populateFn;
    this.sortCriteria = null;
    this.limitCount = null;
    this.shouldPopulate = false;
    this.populateField = null;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  populate(field) {
    this.shouldPopulate = true;
    this.populateField = field;
    return this;
  }

  then(resolve, reject) {
    try {
      let results = [...this.data];

      if (this.sortCriteria) {
        const field = Object.keys(this.sortCriteria)[0];
        const direction = this.sortCriteria[field];
        results.sort((a, b) => {
          const valA = a[field] || '';
          const valB = b[field] || '';
          if (valA < valB) return direction === -1 ? 1 : -1;
          if (valA > valB) return direction === -1 ? -1 : 1;
          return 0;
        });
      }

      if (this.limitCount !== null) {
        results = results.slice(0, this.limitCount);
      }

      if (this.shouldPopulate && this.populateFn) {
        results = results.map(item => this.populateFn(item, this.populateField));
      }

      resolve(results);
    } catch (err) {
      reject(err);
    }
  }
}

class BlogDoc {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    const db = readDb();
    const index = db.blogs.findIndex(b => b._id === this._id);
    this.updatedAt = new Date().toISOString();
    
    // Extract raw fields to save
    const rawData = {};
    for (const key of Object.keys(this)) {
      if (typeof this[key] !== 'function') {
        rawData[key] = this[key];
      }
    }

    if (index !== -1) {
      db.blogs[index] = rawData;
    } else {
      db.blogs.push(rawData);
    }
    writeDb(db);
    return this;
  }
}

export const MockBlogModel = {
  find: (query = {}) => {
    const db = readDb();
    let results = db.blogs;

    const keys = Object.keys(query);
    if (keys.length > 0) {
      results = results.filter(item => {
        return keys.every(key => {
          const expected = query[key];
          if (expected instanceof RegExp) {
            return expected.test(item[key]);
          }
          return item[key] === expected;
        });
      });
    }

    // Convert results to BlogDoc instances so methods are available
    const docResults = results.map(r => new BlogDoc(r));
    return new MockQuery(docResults);
  },

  findById: async (id) => {
    const db = readDb();
    const blog = db.blogs.find(b => b._id === id);
    return blog ? new BlogDoc(blog) : null;
  },

  create: async (data) => {
    const db = readDb();
    const newBlog = {
      _id: 'blog_' + Date.now() + Math.random().toString(36).substr(2, 5),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.blogs.push(newBlog);
    writeDb(db);
    return new BlogDoc(newBlog);
  },

  findByIdAndDelete: async (id) => {
    const db = readDb();
    const index = db.blogs.findIndex(b => b._id === id);
    if (index !== -1) {
      const deleted = db.blogs.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    }
    return null;
  },

  countDocuments: async (query = {}) => {
    const db = readDb();
    let results = db.blogs;
    const keys = Object.keys(query);
    if (keys.length > 0) {
      results = results.filter(item => {
        return keys.every(key => item[key] === query[key]);
      });
    }
    return results.length;
  }
};

export const MockCommentModel = {
  find: (query = {}) => {
    const db = readDb();
    let results = db.comments;

    const keys = Object.keys(query);
    if (keys.length > 0) {
      results = results.filter(item => {
        return keys.every(key => item[key] === query[key]);
      });
    }

    const populateFn = (comment, field) => {
      if (field === 'blog') {
        const blogObj = db.blogs.find(b => b._id === comment.blog);
        return { ...comment, blog: blogObj || comment.blog };
      }
      return comment;
    };

    return new MockQuery(results, populateFn);
  },

  create: async (data) => {
    const db = readDb();
    const newComment = {
      _id: 'comment_' + Date.now() + Math.random().toString(36).substr(2, 5),
      isApproved: false,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.comments.push(newComment);
    writeDb(db);
    return newComment;
  },

  findByIdAndDelete: async (id) => {
    const db = readDb();
    const index = db.comments.findIndex(c => c._id === id);
    if (index !== -1) {
      const deleted = db.comments.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    }
    return null;
  },

  findByIdAndUpdate: async (id, updates) => {
    const db = readDb();
    const index = db.comments.findIndex(c => c._id === id);
    if (index !== -1) {
      db.comments[index] = {
        ...db.comments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      return db.comments[index];
    }
    return null;
  },

  deleteMany: async (query = {}) => {
    const db = readDb();
    const initialCount = db.comments.length;
    const keys = Object.keys(query);
    if (keys.length > 0) {
      db.comments = db.comments.filter(item => {
        return !keys.every(key => item[key] === query[key]);
      });
    } else {
      db.comments = [];
    }
    if (db.comments.length !== initialCount) {
      writeDb(db);
    }
    return { deletedCount: initialCount - db.comments.length };
  },

  countDocuments: async (query = {}) => {
    const db = readDb();
    let results = db.comments;
    const keys = Object.keys(query);
    if (keys.length > 0) {
      results = results.filter(item => {
        return keys.every(key => item[key] === query[key]);
      });
    }
    return results.length;
  }
};
