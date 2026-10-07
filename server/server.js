require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---------- Middleware ----------
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development friendly, no secrets logged)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gym Membership API is running',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// ---------- 404 + Central error handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
// Use PORT from .env; fall back to 5000 if it is missing or invalid (e.g. PORT=0)
const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app;
