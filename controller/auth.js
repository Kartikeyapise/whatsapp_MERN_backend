const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const shortid = require("shortid");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { name, email, password } = req.body;
    // const hash_password = await bcrypt.hash(password, 10);
    // console.log(name, email, password);

    const _user = new User(req.body);
    console.log(_user);

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
        });
      }

      if (user) {
        const { _id, name, email, password } = user;
        const token = jwt.sign(
          { _id, name, email, password },
          process.env.JWT_SECRET,
          {
            //   expiresIn: "1d",
          }
        );
        return res.status(201).json({
          token,
          user: { _id, name, email, password },
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      if (req.body.password == user.password) {
        const { _id, name, email, password } = user;
        const token = jwt.sign(
          { _id, name, email, password },
          process.env.JWT_SECRET,
          {
            //   expiresIn: "1d",
          }
        );
        // const token = generateJwtToken(user._id, user.name);
        res.status(200).json({
          token,
          user: { _id, name, email, password },
        });
      } else {
        return res.status(400).json({
          message: "invalid password",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};
