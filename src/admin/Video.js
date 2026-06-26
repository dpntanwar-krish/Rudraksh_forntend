const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  folder: {
    type: String,
    default: null,
  },
  parentId: {
    type: String,
    default: null,
  },
  sequence: {
    type: Number,
    default: 0,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;