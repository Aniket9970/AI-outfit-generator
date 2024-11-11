const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');

class AgentService {
  constructor() {
    this.agentPath = path.join(__dirname, '../agents/outfit_agent.py');
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    const previewsDir = path.join(uploadsDir, 'previews');
    
    [uploadsDir, previewsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async processOutfit(images, preferences = {}) {
    return new Promise((resolve, reject) => {
      const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
      
      const options = {
        mode: 'text',
        pythonPath: pythonPath,
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: path.dirname(this.agentPath),
        args: [JSON.stringify({ images, preferences })]
      };

      console.log('Starting Python process with options:', {
        scriptPath: options.scriptPath,
        pythonPath: options.pythonPath,
        script: path.basename(this.agentPath)
      });

      if (!fs.existsSync(this.agentPath)) {
        return reject(new Error(`Python script not found at: ${this.agentPath}`));
      }

      let pyshell = new PythonShell(path.basename(this.agentPath), options);
      let jsonOutput = null;
      let errorOutput = [];

      pyshell.on('message', function (message) {
        console.log('Python output:', message);
        try {
          const parsed = JSON.parse(message);
          jsonOutput = parsed;
        } catch (e) {
          console.log('Non-JSON message:', message);
          errorOutput.push(message);
        }
      });

      pyshell.on('stderr', function (stderr) {
        console.error('Python stderr:', stderr);
        errorOutput.push(stderr);
      });

      pyshell.on('error', function (err) {
        console.error('Python shell error:', err);
        errorOutput.push(err.message);
      });

      pyshell.end(function (err) {
        if (err) {
          console.error('Python shell end error:', err);
          console.error('Error output:', errorOutput.join('\n'));
          reject(err);
        } else {
          if (jsonOutput) {
            resolve(jsonOutput);
          } else {
            reject(new Error('No valid JSON output received. Logs: ' + errorOutput.join('\n')));
          }
        }
      });
    });
  }
}

module.exports = new AgentService(); 