require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes');
const imageKitRouter = require('./routes/imagekit.routes');
const complaintRouter = require('./routes/complaint.routes');
const workerRouter = require('./routes/worker.routes');
const adminRouter = require('./routes/admin.routes');


// Initialize express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS with credentials support for HTTP-Only cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Fallback to local Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRouter);

app.use('/api/imagekit', imageKitRouter);

app.use('/api/complaints', complaintRouter);

app.use('/api/worker', workerRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Society Complaint Management System API is running smoothly',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Catch-all route for unhandled routes (404)
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send simplified error message in production, detailed stack trace in development
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.statusCode === 500 ? 'Something went wrong on the server!' : err.message
    });
  }
});

module.exports = app;
