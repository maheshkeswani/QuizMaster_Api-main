const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const Category = require("../models/category");

router.get("/", (req, res, next) => {
  // add checkAuth

  Category.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        category: docs.map((doc) => {
          return {
            _id: doc._id,
            categoryName: doc.categoryName,
            request: {
              type: "GET",
              url: "http://localhost:3000/quizMaster/category/" + doc._id,
            },
          };
        }),
      };
      console.log("response is: ", response);
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", (req, res, next) => {
  Category.find({ categoryName: req.body.categoryName })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        res.status(409).json({
          message: "category already exist",
        });
      } else {
        const category = new Category({
          _id: new mongoose.Types.ObjectId(),
          categoryName: req.body.categoryName,
        });

        category
          .save()
          .then((result) => {
            res.status(200).json({
              message: "Category added successfully",
              createdCategory: {
                _id: result._id,
                categoryName: result.categoryName,
              },
              request: {
                type: "GET",
                url: "http://localhost:3000/quizMaster/category/" + result._id,
              },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:categoryId", (req, res, next) => {
  Category.find({ _id: req.params.categoryId })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        Category.remove({ _id: req.params.categoryId })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "Category deleted successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(409).json({
          message: "There is no such Category",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:categoryId", (req, res, next) => {
  Category.find({ _id: req.params.categoryId })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        const updateOps = {};
        for (const ops of req.body) {
          updateOps[ops.propName] = ops.value;
        }

        Category.update({ _id: req.params.categoryId }, { $set: updateOps })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "Category Updated Successfully",
            });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      } else {
        res.status(409).json({
          message: "Category not exist",
        });
      }
    })
    .catch();
});

router.post("/categoryName", (req, res, next) => {
  Category.find({ categoryName: req.body.categoryName })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        res.status(200).json({
          message: "category found",
          _id: result[0]._id,
        });
      } else {
        res.status(409).json({
          message: "Category not exist",
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
