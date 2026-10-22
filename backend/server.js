require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Connect to MongoDB via Mongoose
connectDB();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'DriveEasy API is running.' });
});

// Routes — all under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Final structured error middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DriveEasy server running on port ${PORT}`);
});
