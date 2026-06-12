import { verifyToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const [bearer, token] = (req.get("authorization") || "").split(" ");

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
