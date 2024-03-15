const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  x: String,
  y: String,
  alpha: String,
});

const resultSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  resultName: {
    type: String,
    required: true,
  },
  algorithm: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Resource', 
    required: true,
  },
  dataset: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Resource', 
    required: true,
  },
  parameters: {
    type: parameterSchema,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
  },
  result: {
    type: Array,
    required: true,
    default: ["No Data Yet"],
  },
});

module.exports = mongoose.model("Result", resultSchema);
