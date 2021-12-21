const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const env = require("dotenv").config();

const app = express();

app.engine(
  "hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      ifCond: function (v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case "!=":
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case "!==":
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case "<":
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case ">":
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case "&&":
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case "||":
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  })
);
app.set("view engine", "hbs");

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "/public")));

require("./middlewares/session")(app);
require("./middlewares/passport")(app);
app.use(require("./middlewares/locals"));

// app.use(function (req, res, next) {
//   if (!req.user)
//     res.set(
//       "Cache-Control",
//       "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
//     );
//   next();
// });

app.use("/admin", require("./routes/admin.route"));

app.use((req, res, next) => {
  if (!req.user) {
    res.redirect("/admin/login");
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  res.render("home");
});

app.use("/account", require("./routes/account.route"));
app.use("/product", require("./routes/product.route"));
app.use("/category", require("./routes/category.route"));
app.use("/producer", require("./routes/producer.route"));

app.use((req, res) => {
  res.render("errors/404", { layout: false });
});

app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).render("errors/500", { layout: false, error: err.message });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("App listening on port 3000");
});
