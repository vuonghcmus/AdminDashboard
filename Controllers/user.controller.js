const User = require("../Models/user.model");

module.exports = {
  getAllUsers: (req, res) => {
    User.find({}, (err, account) => {
      if (err) return next(err);
      res.render("account/list-account", {
        account,
      });
    });
  },
  addAccount: (req, res) => {
    const { name, email, password, address } = req.body;
    const newUser = new User({
      name,
      email,
      password,
      address,
      status: true,
    });
    newUser.save((err) => {
      if (err) return next(err);
      res.redirect("/account/list-account");
    });
  },
  editAccountGet: (req, res) => {
    User.findById(req.params.id, (err, account) => {
      if (err) return next(err);
      res.render("account/edit-account", {
        account,
      });
    });
  },
  editAccountPost: (req, res) => {
    User.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.phone,
          address: req.body.address,
        },
      },
      (err, account) => {
        if (err) return next(err);
        res.redirect("/account/list-account");
      }
    );
  },
  blockAccount: (req, res) => {
    User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: false,
        },
      },
      (err, account) => {
        if (err) return next(err);
        res.redirect("/account/list-account");
      }
    );
  },
  unblockAccount: (req, res) => {
    User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: true,
        },
      },
      (err, account) => {
        if (err) return next(err);
        res.redirect("/account/list-account");
      }
    );
  },
  deleteAccount: (req, res) => {
    User.findByIdAndDelete(req.params.id, (err, account) => {
      if (err) return next(err);
      res.redirect("/account/list-account");
    });
  },
};
