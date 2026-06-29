const mongoose = require('mongoose');

// Establish connection to the test sandbox database before running any tests
beforeAll(async () => {
  const testUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/society_cms_test';
  await mongoose.connect(testUri);
});

// Clear all collections after each test case to maintain clean state isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests in the file complete
afterAll(async () => {
  await mongoose.connection.close();
});
