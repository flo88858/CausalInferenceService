const mongoose = require("mongoose");


const requestSchema = new mongoose.Schema({
  consumer: {
    type: String,
    required: true,
  },
  provider: {
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
  },
  requestedAt: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

module.exports = mongoose.model("Request", requestSchema);
