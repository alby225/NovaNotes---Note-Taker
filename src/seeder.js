require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./models/Note');
const connectDB = require('./config/db');

const sampleNotes = [
  {
    title: 'CodeNova Performance Benchmark & Architecture',
    content:
      'Design a resilient full-stack architecture using Node.js, Express, and MongoDB.\n\nKey pillars:\n1. Strict schema validation and compound indexing\n2. Clean separation of concerns (MVC architecture)\n3. RESTful resource modeling with standardized JSON payloads\n4. Robust error handling middleware and graceful shutdown logic.',
    category: 'Work',
    priority: 'High',
    tags: ['codenova', 'architecture', 'nodejs', 'mongodb'],
    isPinned: true,
    color: '#4f46e5',
  },
  {
    title: 'Sprint Planning & Release Checklist',
    content:
      'Review pending pull requests before end of sprint:\n- Verify unit and integration API responses\n- Ensure all CRUD endpoints return proper HTTP status codes\n- Validate responsive UI layouts across mobile and desktop viewport sizes\n- Audit database connection pooling and query indexing.',
    category: 'Tasks',
    priority: 'High',
    tags: ['sprint', 'checklist', 'qa'],
    isPinned: true,
    color: '#0284c7',
  },
  {
    title: 'Database Indexing & Query Optimization',
    content:
      'MongoDB performance tuning guidelines:\n- Implement compound text indexes for search operations across title and body content\n- Maintain index on isPinned and updatedAt for instantaneous retrieval\n- Use projection and pagination to eliminate memory bloat on large collections.',
    category: 'Study',
    priority: 'Medium',
    tags: ['database', 'indexing', 'performance'],
    isPinned: false,
    color: '#059669',
  },
  {
    title: 'API Authentication & Token Refresh Strategy',
    content:
      'Explore stateless JWT vs secure HttpOnly session cookies. Evaluate rate-limiting middleware (express-rate-limit) and input sanitization to guard against NoSQL injection vectors in future iterations.',
    category: 'Ideas',
    priority: 'Medium',
    tags: ['security', 'jwt', 'backend'],
    isPinned: false,
    color: '#d97706',
  },
  {
    title: 'Daily Standup Highlights & Workstream Sync',
    content:
      'Standup discussion points:\n- Completed backend controllers with error handling middleware\n- Integrated live search debouncing on the frontend client\n- Validated MongoDB connection lifecycle and reconnection events.',
    category: 'Work',
    priority: 'Low',
    tags: ['standup', 'meeting', 'team'],
    isPinned: false,
    color: '#7c3aed',
  },
  {
    title: 'Weekend Reading & Skill Expansion',
    content:
      'Recommended engineering literature:\n1. Designing Data-Intensive Applications by Martin Kleppmann\n2. Clean Code & Clean Architecture by Robert C. Martin\n3. Cloud-Native Patterns with Docker and Kubernetes.',
    category: 'Personal',
    priority: 'Low',
    tags: ['books', 'reading', 'learning'],
    isPinned: false,
    color: '#db2777',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing notes collection...');
    await Note.deleteMany();

    console.log('[Seeder] Inserting production-grade sample notes...');
    await Note.insertMany(sampleNotes);

    console.log(`[Seeder] Successfully seeded ${sampleNotes.length} notes!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
