const mongoose = require("mongoose");
const User = require("./models/user.js");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      //   unique: true,
      index: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const whatsappSchema = new mongoose.Schema(
  {
    message: String,
    name: String,
    // timestamp: String,
    // received: Boolean,
    fromUser: userSchema,
    toUser: userSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("mesagecontents", whatsappSchema);
