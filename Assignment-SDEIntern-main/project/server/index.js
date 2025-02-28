import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, 'data.json');

// JWT Secret
const JWT_SECRET = 'your-secret-key-should-be-in-env-file';
const TOKEN_EXPIRY = '24h';

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
  try {
    await fs.access(dataPath);
  } catch (error) {
    await fs.writeFile(dataPath, JSON.stringify({ users: [], surveys: [], responses: [] }));
  }
};

// Read data from file
const readData = async () => {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
};

// Write data to file
const writeData = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize data file
initializeDataFile();

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const data = await readData();
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create and assign token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const data = await readData();
    
    // Check if user already exists
    if (data.users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role: 'user', // Default role
      createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    await writeData(data);
    
    // Create and assign token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const user = data.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get all surveys (protected)
app.get('/api/surveys', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.surveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// Get a specific survey (protected)
app.get('/api/surveys/:id', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const survey = data.surveys.find(s => s.id === req.params.id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// Create a new survey (protected)
app.post('/api/surveys', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const newSurvey = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    data.surveys.push(newSurvey);
    await writeData(data);
    
    res.status(201).json(newSurvey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Update a survey (protected)
app.put('/api/surveys/:id', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const surveyIndex = data.surveys.findIndex(s => s.id === req.params.id);
    
    if (surveyIndex === -1) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    data.surveys[surveyIndex] = {
      ...data.surveys[surveyIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    await writeData(data);
    
    res.json(data.surveys[surveyIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// Delete a survey (protected, admin only)
app.delete('/api/surveys/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    const data = await readData();
    const surveyIndex = data.surveys.findIndex(s => s.id === req.params.id);
    
    if (surveyIndex === -1) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    data.surveys.splice(surveyIndex, 1);
    await writeData(data);
    
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// Submit a survey response (public)
app.post('/api/responses', async (req, res) => {
  try {
    const data = await readData();
    const newResponse = {
      id: Date.now().toString(),
      ...req.body,
      submittedAt: new Date().toISOString()
    };
    
    data.responses.push(newResponse);
    await writeData(data);
    
    res.status(201).json(newResponse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get responses for a specific survey (protected)
app.get('/api/surveys/:id/responses', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const responses = data.responses.filter(r => r.surveyId === req.params.id);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get analytics for a specific survey (protected)
app.get('/api/surveys/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    const survey = data.surveys.find(s => s.id === req.params.id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    const responses = data.responses.filter(r => r.surveyId === req.params.id);
    
    // Process analytics based on question types
    const analytics = survey.questions.map(question => {
      const questionResponses = responses.map(r => r.answers.find(a => a.questionId === question.id));
      
      let result = {
        questionId: question.id,
        questionText: question.text,
        type: question.type,
        totalResponses: questionResponses.filter(r => r).length
      };
      
      if (question.type === 'radio' || question.type === 'checkbox') {
        const optionCounts = {};
        question.options.forEach(option => {
          optionCounts[option.value] = 0;
        });
        
        questionResponses.forEach(response => {
          if (!response) return;
          
          if (question.type === 'radio') {
            optionCounts[response.value] = (optionCounts[response.value] || 0) + 1;
          } else if (question.type === 'checkbox') {
            response.values.forEach(value => {
              optionCounts[value] = (optionCounts[value] || 0) + 1;
            });
          }
        });
        
        result.optionCounts = optionCounts;
      } else if (question.type === 'text') {
        result.responses = questionResponses
          .filter(r => r)
          .map(r => r.value);
      }
      
      return result;
    });
    
    res.json({
      surveyId: survey.id,
      surveyTitle: survey.title,
      totalResponses: responses.length,
      analytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get active survey for cart page (public)
app.get('/api/active-survey', async (req, res) => {
  try {
    const data = await readData();
    const activeSurvey = data.surveys.find(s => s.active);
    
    if (!activeSurvey) {
      return res.status(404).json({ error: 'No active survey found' });
    }
    
    res.json(activeSurvey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active survey' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});