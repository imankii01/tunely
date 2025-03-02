const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const tunnelRoutes = require('./routes/tunnel');
const app = express();

connectDB();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/tunnel', tunnelRoutes);

app.listen(3000, () => console.log('Backend running on port 3000'));