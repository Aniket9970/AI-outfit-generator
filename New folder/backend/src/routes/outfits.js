const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage, getSuggestions } = require('../controllers/outfitController');

router.post('/upload', upload.array('images', 10), uploadImage);
router.get('/suggestions', getSuggestions);

module.exports = router; 