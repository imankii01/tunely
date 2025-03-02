const express = require('express');
const router = express.Router();
const Tunnel = require('../models/Tunnel');
const authMiddleware = require('../middleware/auth');

// Create Tunnel
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const subdomain = Math.random().toString(36).substring(2, 8); // e.g., abc123

    const existingTunnel = await Tunnel.findOne({ subdomain });
    if (existingTunnel) {
      return res.status(400).json({ message: 'Subdomain already in use' });
    }

    const tunnel = new Tunnel({
      userId: user.id,
      subdomain,
    });
    await tunnel.save();

    res.json({ subdomain: `${subdomain}.tunely.snapstay.in` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;