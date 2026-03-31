import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", (req, res) => {
  console.log("Fetching users");
  res.json([{ id: 1, name: "Alice" }]);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
