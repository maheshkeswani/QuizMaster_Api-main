const mongoose = require("mongoose");

const refreshTokenSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  refreshTokenId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
