import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export const createToken = (payload) =>
  jwt.sign(payload, secret, { expiresIn: "1d" });


export const verifyToken = (token) => jwt.verify(token, secret);
