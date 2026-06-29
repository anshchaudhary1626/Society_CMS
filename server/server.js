const dotenv = require('dotenv');

// Handle uncaught exceptions (synchronous errors that happen outside Express request lifecycle)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, ':', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Load environment variables from .env file
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db')

connectDB()
// Define port
const port = process.env.PORT || 5001;

// Start server
const server = app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Handle unhandled rejections (asynchronous promise rejections that aren't caught)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, ':', err.message);
  if (err.stack) console.error(err.stack);

  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});
