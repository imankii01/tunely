const mongoose = require('mongoose');
const TunnelSchema = new mongoose.Schema({
  token: String,
  subdomain: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Tunnel', TunnelSchema);