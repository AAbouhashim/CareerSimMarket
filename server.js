const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('@prisma/client');
const app = express();
const prismaClient = new prisma.PrismaClient();
const PORT = 3000;

app.use(express.json());

// JWT Secret
const JWT_SECRET = 'your_secret_key';  // Change this to a secure key in production

// Middleware to protect routes
function authenticate(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Unauthorized');
    req.userId = decoded.id;
    next();
  });
}

// Authentication routes

app.get('/', (req, res) => {
  res.send('Welcome to the Market API!');
});

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // Check if the user already exists
  const existingUser = await prismaClient.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(400).send('User already exists');
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prismaClient.user.create({
    data: { username, password: hashedPassword },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prismaClient.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Product routes

// Get all products
app.get('/products', async (req, res) => {
  const products = await prismaClient.product.findMany();
  res.json(products);
});

// Get a single product by ID
app.get('/products/:id', async (req, res) => {
  const product = await prismaClient.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      orders: {
        where: { userId: req.userId },  // If logged in, include user orders
      },
    },
  });
  if (!product) return res.status(404).send('Product not found');
  res.json(product);
});

// Order routes (protected)

// Get all orders for the logged-in user
app.get('/orders', authenticate, async (req, res) => {
  const orders = await prismaClient.order.findMany({
    where: { userId: req.userId },
    include: {
      products: true,
    },
  });
  res.json(orders);
});

// Create a new order for the logged-in user
app.post('/orders', authenticate, async (req, res) => {
  const { date, note, productIds } = req.body;
  
  // Validate the products
  const products = await prismaClient.product.findMany({
    where: { id: { in: productIds } },
  });
  if (products.length !== productIds.length) {
    return res.status(400).send('Some products do not exist');
  }

  const order = await prismaClient.order.create({
    data: {
      date,
      note,
      userId: req.userId,
      products: {
        connect: productIds.map(id => ({ id })),
      },
    },
  });
  res.json(order);
});

// Get a specific order (only the user who made the order can view it)
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await prismaClient.order.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { products: true },
  });

  if (!order) return res.status(404).send('Order not found');
  if (order.userId !== req.userId) return res.status(403).send('Forbidden');
  
  res.json(order);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});