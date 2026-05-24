import express from "express";

const app = express();
const PORT = 8080;

app.use(express.json());

/**
 * GET /users
 */
app.get("/users", (req, res) => {
  res.status(200).json([
    { id: 1, name: "Ankit" },
    { id: 2, name: "Rahul" },
  ]);
});

/**
 * GET /products
 */
app.get("/products", (req, res) => {
  res.status(200).json([
    { id: 101, product: "Laptop" },
    { id: 102, product: "Keyboard" },
  ]);
});

/**
 * GET /slow
 * Simulates a slow API response
 */
app.get("/slow", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  res.status(200).json({
    message: "Slow response after 3 seconds",
  });
});

/**
 * GET /large
 * Returns a large payload
 */
app.get("/large", (req, res) => {
  const largeData = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    value: `Item-${i}`,
  }));

  res.status(200).json(largeData);
});

/**
 * GET /error
 * Simulates server error
 */
app.get("/error", (req, res) => {
  res.status(500).json({
    error: "Internal Server Error",
  });
});

/**
 * POST /echo
 * Returns the same body sent by client
 */
app.post("/echo", (req, res) => {
  res.status(200).json({
    received: req.body,
  });
});

/**
 * Default 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Fake origin server running on http://localhost:${PORT}`);
});