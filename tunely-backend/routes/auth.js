const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, 'secret_key');
    const user = new User({ email, password: hashedPassword, token });
    await user.save();
    res.json({ token });
  } catch (e) {
    res.status(400).send('Error registering user');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ token: user.token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

module.exports = router;