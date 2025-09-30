const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const serverConfig = require('./config/server.config');
const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { getCredentialStatus } = require('./utils/validation.util');

const app = express();

app.use(cors({
  origin: serverConfig.frontendUrl,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session(serverConfig.session));

app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/credentials', (req, res) => {
  const status = getCredentialStatus();
  res.json({
    success: status.valid,
    ...status
  });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
