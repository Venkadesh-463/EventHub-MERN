const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('⚠️ Warning: Could not find .env file at', envPath);
} else {
  console.log('✅ .env file loaded from', envPath);
}

console.log('🚀 Starting server setup...');
console.log('📦 MONGO_URI from env:', process.env.MONGO_URI ? 'FOUND (hidden)' : 'NOT FOUND');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/college', require('./routes/collegeRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
