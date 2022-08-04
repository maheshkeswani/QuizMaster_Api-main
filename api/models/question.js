const mongoose = require("mongoose");
const router = require("../routes/category");

const questionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  statement: { type: String, required: true },
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  correctAnswer: { type: String, required: true },
  incorrectAnswer: { type: Array, required: true },
});

module.exports = mongoose.model("Question", questionSchema);
