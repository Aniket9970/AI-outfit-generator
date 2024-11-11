const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const outfitsRouter = require('./routes/outfits');

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-render-app-name.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve preview images
app.use('/uploads/previews', express.static(path.join(__dirname, '../uploads/previews')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/outfits', outfitsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max size is 5MB.' });
    }
  }
  res.status(500).json({ error: err.message || 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 