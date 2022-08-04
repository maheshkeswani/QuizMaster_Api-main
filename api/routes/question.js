const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Question = require("../models/question");
const Category = require("../models/category");
const checkAuth = require("../middleware/check-auth");

router.post("/:categoryId", checkAuth, (req, res, next) => {
  console.log("id through parameter is: ", req.params.categoryId);
  Category.find({ _id: req.params.categoryId })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        console.log("req is: ", req.body);

        const question = new Question({
          _id: mongoose.Types.ObjectId(),
          statement: req.body.statement,
          categoryId: req.params.categoryId,
          correctAnswer: req.body.correctAnswer,
          incorrectAnswer: req.body.incorrectAnswer,
        });

        question
          .save()
          .then((result) => {
            const response = {
              _id: result._id,
              message: "Question added successfully",
              question: result.statement,
              categoryId: req.params.categoryId,
              correctAnswer: result.correctAnswer,
              incorrectAnswer: result.incorrectAnswer,
            };

            res.status(200).json(response);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(409).json({
          message: "category does not exist",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//route of category question

router.get("/:categoryId", (req, res, next) => {
  Question.find({ categoryId: req.params.categoryId })
    .select("statement categoryId correctAnswer incorrectAnswer")
    .exec()
    .then((docs) => {
      if (docs.length >= 1) {
        res.status(200).json({
          count: docs.length,
          questions: docs,
        });
      } else {
        res.status(404).json({
          message: "No data found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:questionId", (req, res, next) => {
  Question.find({ _id: req.params.questionId })
    .exec()
    .then((result) => {
      if (result.length != 0) {
        Question.remove({ _id: req.params.questionId })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "Question deleted successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(404).json({
          message: "no data found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:questionId", (req, res, next) => {
  Question.find({ _id: req.params.questionId })
    .exec()
    .then((result) => {
      if (result.length > 0) {
        Question.remove({ _id: req.params.questionId })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "Question deleted successfully",
            });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        result.status(404).json({
          message: "question does not exist",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
