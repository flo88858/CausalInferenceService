const mongoose = require("mongoose");


const resourceSchema = new mongoose.Schema({
  resourceName: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  executionPath: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "public",
  },
  uploadedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  imageID: {
    type: String,
    required: false
  },
  language:{
    type: String,
    required: false
  }
});

// Partial unique index for resourceName
resourceSchema.index(
  { resourceName: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['public', 'private', 'processing'] } } }
);

module.exports = mongoose.model("Resource", resourceSchema);
