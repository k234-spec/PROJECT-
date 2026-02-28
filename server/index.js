require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/projects', require('./routes/contributions'));

// API index
app.get('/api', (req, res) => {
  res.json({
    name: 'Portfolio SaaS API',
    version: '1.0.0',
    status: 'running',
    database: 'MongoDB',
    endpoints: {
      register:     'POST /api/auth/register',
      login:        'POST /api/auth/login',
      me:           'GET  /api/auth/me (auth)',
      projects:     'GET  /api/projects',
      myProjects:   'GET  /api/projects/mine (auth)',
      getProject:   'GET  /api/projects/:id',
      createProject:'POST /api/projects (auth)',
      updateProject:'PUT  /api/projects/:id (auth)',
      deleteProject:'DELETE /api/projects/:id (auth)',
      testimonial:  'POST /api/projects/:id/testimonials',
      upload:       'POST /api/upload (auth)',
      health:       'GET  /api/health',
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.get('/', (req, res) => res.redirect('/api'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', hint: 'Visit /api to see all available endpoints' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB then start server
connect().then(() => {
  app.listen(PORT, () => {
    console.log(` Server: http://localhost:${PORT}`);
    console.log(` API:    http://localhost:${PORT}/api`);
    console.log(` DB:     ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio'}`);
  });
});

module.exports = app;
