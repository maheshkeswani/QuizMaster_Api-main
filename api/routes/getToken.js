const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/refreshToken");

router.post("/", (req, res, next) => {
  RefreshToken.find({ refreshTokenId: req.body.refreshTokenId })
    .exec()
    .then((result) => {
      console.log("dekh lo", result);

      if (result.length >= 1) {
        jwt.verify(
          req.body.refreshTokenId,
          process.env.JWT_REFRESHPRIVATEKEY,
          (err, user) => {
            if (err) {
              return res.status(401).json({
                message: "unauthorized user",
              });
            }

            console.log(user);
            const accessToken = jwt.sign(
              {
                email: user.email, // payload data of user given to jwt
                userId: user.userId,
              },
              process.env.JWT_PRIVATEKEY,
              { expiresIn: "6m" } // access token expires in a minute.
            );

            return res.status(200).json({
              token: accessToken,
            });
          }
        );
      } else {
        return res.status(401).json({
          message: "unauthorized",
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
