const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

router.get("/dashboard", async (req, res) => {
  try {
    const products = await Product.find().lean();
    const inStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const outOfStockCount = await Product.countDocuments({ quantity: 0 });

    res.render("dashboard", {
      products,
      inStockValue,
      sales: 50000000, 
      orders: 15000000,
      outOfStockCount,
      errors: {} 
    });
  } catch (err) {
    console.error(err); 
    res.status(500).send("Server Error");
  }
});

router.post("/dashboard/add", upload.single('image'), async (req, res) => {
  const { name, category, price, quantity, color } = req.body;
  const errors = {};

  if (!name) errors.name = "Invalid field";
  if (!category) errors.category = "Invalid field";
  if (!price) errors.price = "Invalid field";
  if (!quantity) errors.quantity = "Invalid field";
  if (!color) errors.color = "Invalid field";
  if (!req.file) errors.image = "Invalid field";

  if (Object.keys(errors).length > 0) {
    const products = await Product.find();
    return res.render("dashboard", { products, errors, inStockValue: 0, outOfStockCount: 0 });
  }

  try {
    const newProduct = new Product({
      name,
      category,
      price,
      quantity,
      color,
      image: req.file.filename
    });
    await newProduct.save();
    req.flash('success_msg', 'Product added successfully');
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;