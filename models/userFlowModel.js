const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: String,
  type: String,
  position: {
    x: Number,
    y: Number,
  },
  data: Object,
});

const edgeSchema = new mongoose.Schema({
  id: String,
  source: String,
  target: String,
  type: String,
});

const userFlowSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    flow: {
      nodes: { type: Array, default: [] },
      edges: { type: Array, default: [] }
    }
  });

module.exports = mongoose.model('UserFlow', userFlowSchema);
