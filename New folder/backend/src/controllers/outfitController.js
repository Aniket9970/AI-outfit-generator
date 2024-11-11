const agentService = require('../services/agentService');
const path = require('path');
const fs = require('fs');

const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);

    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files;
    console.log('Processing files:', files.map(f => ({
      name: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
      path: f.path
    })));

    // Convert Windows paths to URL format
    const filePaths = files.map(file => {
      const relativePath = path.relative(path.join(__dirname, '../../uploads'), file.path)
        .split(path.sep)
        .join('/');
      return `http://localhost:${process.env.PORT || 8000}/uploads/${relativePath}`;
    });

    console.log('File URLs:', filePaths);

    // Process with Python agent
    const agentResponse = await agentService.processOutfit(filePaths, {
      prompt: req.body.prompt || '',
      images: filePaths
    });

    console.log('Agent response:', agentResponse);

    res.json({ 
      message: 'Images processed successfully',
      count: files.length,
      files: filePaths,
      suggestions: agentResponse
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

const getSuggestions = async (req, res) => {
  try {
    console.log('Getting suggestions with query:', req.query);
    
    if (!req.query.prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const agentResponse = await agentService.processOutfit([], {
      prompt: req.query.prompt
    });

    console.log('Agent response for suggestions:', agentResponse);
    
    res.json({ suggestions: agentResponse || [] });
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
};

module.exports = {
  uploadImage,
  getSuggestions
}; 