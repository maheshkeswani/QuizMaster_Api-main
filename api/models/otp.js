const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    otp: {
      type: String,
      required: true,
      unique: true, // unique does not validate unique email but it improve funtionality to do check uniqueness of email
      // to check right pattern of email
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
