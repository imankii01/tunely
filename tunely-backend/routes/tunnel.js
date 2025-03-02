const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Tunnel = require('../models/Tunnel');

router.post('/', async (req, res) => {
  const { token } = req.body;
  try {
    jwt.verify(token, 'secret_key');
    const subdomain = Math.random().toString(36).substring(2, 8); // e.g., abc123
    const tunnel = new Tunnel({ token, subdomain });
    await tunnel.save();
    res.json({ subdomain: `${subdomain}.tunely.snapstay.in` });
  } catch (e) {
    res.status(401).send('Invalid token');
  }
});

module.exports = router;