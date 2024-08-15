const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    text: {
      type: String,
    },
    sender: {
      type: String,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", messagesSchema);
