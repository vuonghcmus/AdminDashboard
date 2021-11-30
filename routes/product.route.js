const express = require("express");
const router = express.Router();
const Product = require("../Models/product.model");
const Category = require("../Models/category.model");
const Producer = require("../Models/producer.model");
const to_slug = require("../public/js/slug.js");

// show list product
router.get("/list-product", (req, res) => {
  Product.find({}, (err, product) => {
    if (err) return next(err);
    res.render("product/list-product", {
      product,
    });
  });
});

// add product
router.get("/add-product", async (req, res) => {
  const category = await Category.find({});
  const producer = await Producer.find({});
  res.render("product/add-product", {
    category,
    producer,
  });
});

//add product post and add product id to category
router.post("/add-product", (req, res) => {
  const product = new Product({
    name: req.body.name,
    details: req.body.details,
    quantity: req.body.quantity,
    price: req.body.price,
    image: req.body.urlImage,
    category: req.body.category,
    producer: req.body.producer,
    idProduct: to_slug(req.body.name) + "-" + Date.now(),
    listIdRating: [],
  });

  product.save((err) => {
    if (err) {
      console.log(err);
      res.render("product/add-product", {
        msg: err,
      });
    } else {
      // find category and push product id
      Category.findByIdAndUpdate(
        req.body.id_category,
        {
          $push: {
            listIdProduct: product._id,
          },
        },
        (err, cha) => {
          if (err) {
            console.log(err);
          } else {
            // find producer and push product id
            Producer.findByIdAndUpdate(
              req.body.id_producer,
              {
                $push: {
                  listIdProduct: product._id,
                },
              },
              (err, pro) => {
                if (err) {
                  console.log(err);
                } else {
                  res.redirect("/product/list-product");
                }
              }
            );
          }
        }
      );
    }
  });
});

// edit product and find current id category of this product
router.get("/edit-product/:id", async (req, res) => {
  // find all category using async await
  const category = await Category.find({});
  const producer = await Producer.find({});

  // find id category that have this product id in listIdProduct
  Product.findById(req.params.id, (err, product) => {
    if (err) return next(err);
    Category.find({ listIdProduct: product._id }, (err, currentCategory) => {
      if (err) return next(err);
      res.render("product/edit-product", {
        product,
        producer,
        category,
        idCurrentCategory: currentCategory[0]._id,
      });
    });
  });
});

// edit product post and remove product id to old category and push product id to new category
// and remove product id from listIdProduct of old producer and push product id to new producer
// and using async await
router.post("/edit-product", async (req, res) => {
  // find product and update
  const product = await Product.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        name: req.body.name,
        details: req.body.details,
        quantity: req.body.quantity,
        price: req.body.price,
        image: req.body.urlImage,
        category: req.body.category,
        producer: req.body.producer,
        idProduct: to_slug(req.body.name) + "-" + Date.now(),
        listIdRating: [],
      },
    },
    async (err, product) => {
      if (err) return next(err);
      // find old category and remove product id
      const currentCategory = await Category.find({
        listIdProduct: product._id,
      }).clone();
      // find category and remove product id
      await Category.findByIdAndUpdate(
        currentCategory[0]._id,
        {
          $pull: {
            listIdProduct: product._id,
          },
        },
        async (err, cha) => {
          if (err) {
            console.log(err);
          } else {
            // find category and push product id
            await Category.findByIdAndUpdate(
              req.body.id_category,
              {
                $push: {
                  listIdProduct: product._id,
                },
              },
              async (err, cha) => {
                if (err) {
                  console.log(err);
                } else {
                  // find old producer and remove product id
                  const currentProducer = await Producer.find({
                    listIdProduct: product._id,
                  }).clone();
                  // find producer and remove product id
                  await Producer.findByIdAndUpdate(
                    currentProducer[0]._id,
                    {
                      $pull: {
                        listIdProduct: product._id,
                      },
                    },
                    async (err, cha) => {
                      if (err) {
                        console.log(err);
                      } else {
                        // find producer and push product id
                        await Producer.findByIdAndUpdate(
                          req.body.id_producer,
                          {
                            $push: {
                              listIdProduct: product._id,
                            },
                          },
                          (err, cha) => {
                            if (err) {
                              console.log(err);
                            } else {
                              res.redirect("/product/list-product");
                            }
                          }
                        ).clone();
                      }
                    }
                  ).clone();
                }
              }
            ).clone();
          }
        }
      ).clone();
    }
  ).clone();
});

// delete product
router.get("/delete-product/:id", async (req, res) => {
  Product.findByIdAndDelete(req.params.id, async (err, product) => {
    if (err) return next(err);
    // find category and remove product id
    const currentCategory = await Category.find({
      listIdProduct: req.params.id,
    }).clone();
    // find category and remove product id
    await Category.findByIdAndUpdate(
      currentCategory[0]._id,
      {
        $pull: {
          listIdProduct: req.params.id,
        },
      },
      async (err, cha) => {
        if (err) {
          console.log(err);
        } else {
          // find producer and remove product id
          const currentProducer = await Producer.find({
            listIdProduct: req.params.id,
          }).clone();
          // find producer and remove product id
          await Producer.findByIdAndUpdate(
            currentProducer[0]._id,
            {
              $pull: {
                listIdProduct: req.params.id,
              },
            },
            (err, cha) => {
              if (err) {
                console.log(err);
              } else {
                res.redirect("/product/list-product");
              }
            }
          ).clone();
        }
      }
    ).clone();
  }).clone();
});

module.exports = router;
