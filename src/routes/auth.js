import { Router } from "express";
import { createToken } from "../utils/jwt.js";

const router = Router();

router.post("/login", (req, res) => {
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;

  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  if (req.body.email !== email || req.body.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    token: createToken({ email }),
    tokenType: "Bearer",
  });
});

export default router;
