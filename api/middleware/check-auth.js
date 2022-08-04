const jwt = require("jsonwebtoken");

const GlobalUser = require("../models/globalUser");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[0];
    console.log("token is", token);
    const decode = jwt.verify(token, process.env.JWT_PRIVATEKEY);
    console.log("decode is", decode);

    GlobalUser.find({ email: decode.email })
      .exec()
      .then((user) => {
        console.log(user.length);
        if (user.length <= 0) {
          next();
        }
      });

    req.userData = token;
    next();
  } catch (error) {
    console.log("check_auth error is", error);
    res.status(401).json({
      Message: "auth failed",
    });
  }
};
