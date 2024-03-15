const mongoose = require("mongoose");


const contractSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
  },
  consumer: {
    type: String,
    required: true,
  },
  resourceID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Resource',
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("Contract", contractSchema);

