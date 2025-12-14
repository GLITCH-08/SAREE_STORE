const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// serve static HTML from /public
app.use(express.static("public"));

// --- MongoDB (Atlas) setup ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// --- Mongo Schema ---
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  tags: [String],
  imageDriveId: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// save product AFTER image is uploaded to Drive on frontend
app.post("/api/save-product", async (req, res) => {
  try {
    const { title, description, price, tags, imageDriveId, imageUrl } = req.body;

    if (!imageUrl || !imageDriveId) {
      return res.status(400).json({ error: "Missing imageUrl or imageDriveId" });
    }

    const product = new Product({
      title,
      description,
      price: price ? Number(price) : undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      imageDriveId,
      imageUrl,
    });

    const saved = await product.save();

    res.json({
      message: "Product saved successfully",
      product: saved,
    });
  } catch (err) {
    console.error("Save product error:", err);
    res.status(500).json({ error: "Save product failed", details: err.message });
  }
});

// (optional) list products for your React catalog later
app.get("/api/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser`);
});
