const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
//const connectDB = require('./config/db');
const path = require('path');


const sensorSimulator = require('./services/sensorSimulator');

dotenv.config();
require('./config/db');

const app = express();
const userRoutes = require('./routes/authRoutes');
const flowRoutes = require('./routes/userFlowRoutes');


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:8010",
      methods: ["GET", "POST"]
    }
  });

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', userRoutes);
app.use('/api', flowRoutes);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  socket.on('start-simulator', () => {
    sensorSimulator.start(io);
    socket.emit('simulator-status', { running: true });
  });
  
  socket.on('stop-simulator', () => {
    sensorSimulator.stop();
    socket.emit('simulator-status', { running: false });
  });
});

app.post('/api/simulator/start', (req, res) => {
    const success = sensorSimulator.start(io);
    res.json({ success, message: 'Sensor simulator started' });
  });
  app.post('/api/simulator/stop', (req, res) => {
    const success = sensorSimulator.stop();
    res.json({ success, message: 'Sensor simulator stopped' });
  });
  app.get('/api/simulator/status', (req, res) => {
    const status = sensorSimulator.getStatus();
    res.json(status);
  });
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
sensorSimulator.start(io);