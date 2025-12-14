import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.CATALOG_SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URL);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db(process.env.DATABASE_NAME);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const collection = db.collection(process.env.COLLECTION_NAME);
    const products = await collection.find({}).toArray();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection(process.env.COLLECTION_NAME);
    const product = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Image proxy endpoint - serves Google Drive images
app.get('/api/image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Validate file ID format
    if (!fileId || !/^[a-zA-Z0-9-_]+$/.test(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }
    
    // Fetch from Google Drive
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const response = await fetch(driveUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch image from Google Drive'
      });
    }
    
    // Set proper content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Stream the image
    response.body.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Saree Catalog API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      singleProduct: '/api/products/:id'
    }
  });
});

// Start server
async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

startServer();