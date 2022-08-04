const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for hashing the password.
const jwt = require("jsonwebtoken"); // for making token
const otpGenerator = require("otp-generator"); // for genereate OTP.

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const Otp = require("../models/otp");
const nodemailer = require("nodemailer");

//testing
const GlobalUser = require("../models/globalUser");
//testing

router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          console.log(doc);
          return {
            _id: doc._id,
            email: doc.email,
            password: doc.password,
          };
        }),
      };
      res.status(200).json(response);
    });
});

router.get("/getUserRefreshToken", (req, res, next) => {
  RefreshToken.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          console.log(doc);
          return {
            _id: doc._id,
            refreshToken: doc.refreshTokenId,
          };
        }),
      };
      res.status(200).json(response);
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        //check valid email
        return res.status(401).json({
          message: "auth failed",
        });
      } else {
        // check valid password
        bcrypt.compare(
          req.body.password,
          user[0].password,
          function (err, result) {
            if (err) {
              // error comes while in hashing the given password
              return res.status(401).json({
                error: err,
              });
            }
            if (result) {
              const token = jwt.sign(
                {
                  email: user[0].email, // payload data of user given to jwt
                  userId: user[0]._id,
                },
                process.env.JWT_PRIVATEKEY,
                { expiresIn: "6m" } // access token expires in a minute.
              );

              const madeRefreshToken = jwt.sign(
                {
                  email: user[0].email,
                  userId: user[0]._id,
                },
                process.env.JWT_REFRESHPRIVATEKEY,
                { expiresIn: "8d" } // access token expires in a week.
              );

              const refreshToken = new RefreshToken({
                _id: new mongoose.Types.ObjectId(),
                refreshTokenId: madeRefreshToken,
              });

              refreshToken.save();

              return res.status(200).json({
                message: "auth successful",
                token: token,
                refreshToken: madeRefreshToken,
              });
            }

            res.status(401).json({
              message: "auth failed",
            });
          }
        );
      }
    })
    .catch((err) => {
      res.status(401).json({
        error: err,
      });
    });
});

router.delete("/logout", (req, res, next) => {
  RefreshToken.remove({ refreshTokenId: req.body.refreshTokenId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "log out successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/delete", (req, res, next) => {
  User.remove({ email: req.body.email })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "user deleted",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/signUp", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      console.log(user);
      if (user.length >= 1) {
        res.status(409).json({
          message: "Email already exist",
        });
      } else {
        const OTP = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });

        const autoGenOTP = new Otp({
          _id: new mongoose.Types.ObjectId(),
          otp: OTP,
          createdAt: new Date(),
        });

        autoGenOTP.save();

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SENDING_EMAIL_ID, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD, // generated ethereal password
          },
        });

        let sendingMail = {
          from: "QuizMaster? <foo@blurdybloop.com>", // sender address
          to: req.body.email, // list of receivers
          subject: "Account Activation Link", // Subject line
          html: `<div><p>To Activate your Account please verify this email </p><p>Your One Time password is ${OTP}</p></div>`,
        };

        transporter.sendMail(sendingMail, (err, data) => {
          if (err) console.log(err);
          else {
            return res.status(200).json({
              message: "Email sent Successfully",
              OTP: OTP,
            });
          }
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

router.post("/email-activate", (req, res, next) => {
  const { email, password, userOTP } = req.body;
  Otp.find({ otp: userOTP })
    .exec()
    .then((result) => {
      if (result.length === 0) {
        res.status(409).json({
          message: "OTP does not valid",
        });
      } else {
        bcrypt.hash(password, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: email,
              password: hash,
            });

            const globalUser = new GlobalUser({
              _id: new mongoose.Types.ObjectId(),
              email: email,
            });

            globalUser.save();

            user
              .save()
              .then((result) => {
                console.log("result is ", result);
                res.status(201).json({
                  message: "User created successfully",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

router.get("/otp", (req, res, next) => {
  Otp.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          console.log(doc);
          return {
            _id: doc._id,
            otp: doc.otp,
          };
        }),
      };
      res.status(200).json(response);
    });
});

router.delete("/otp-delete", (req, res, next) => {
  Otp.remove({ otp: req.body.otp })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "otp deleted",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//testing

router.get("/globalUser", (req, res, next) => {
  GlobalUser.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          console.log(doc);
          return {
            _id: doc._id,
            email: doc.email,
          };
        }),
      };
      res.status(200).json(response);
    });
});

router.delete("/globalUser/delete", (req, res, next) => {
  GlobalUser.remove({ email: req.body.email })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "user deleted",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/googleUser/signUp", (req, res, next) => {
  console.log("google user email is: ", req.body.email);
  GlobalUser.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length === 0) {
        const globalUser = new GlobalUser({
          _id: new mongoose.Types.ObjectId(),
          email: email,
        });
        globalUser
          .save()
          .then((result) => {
            res.status(200).json({
              message: "google user signUp successfully",
            });
          })
          .catch((err) => {
            res.status(401).json({
              message: "unauthorized user",
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/googleUser/login", (req, res, next) => {
  console.log("google user email is: ", req.body.email);

  GlobalUser.find({ email: req.body.email })
    .exec()
    .then((user) => {
      const token = jwt.sign(
        {
          email: user[0].email, // payload data of user given to jwt
          userId: user[0]._id,
        },
        process.env.JWT_PRIVATEKEY,
        { expiresIn: "6m" } // access token expires in a minute.
      );

      const madeRefreshToken = jwt.sign(
        {
          email: user[0].email,
          userId: user[0]._id,
        },
        process.env.JWT_REFRESHPRIVATEKEY,
        { expiresIn: "8d" } // access token expires in a week.
      );

      const refreshToken = new RefreshToken({
        _id: new mongoose.Types.ObjectId(),
        refreshTokenId: madeRefreshToken,
      });

      refreshToken.save();

      return res.status(200).json({
        message: "auth successful",
        token: token,
        refreshToken: madeRefreshToken,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
