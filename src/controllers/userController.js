import { UniqueConstraintError, ValidationError } from "sequelize";
import User from "../models/User.js";

// GET /users?limit=10&offset=0
export const getUsers = async (req, res) => {
  try {
    const limit = Math.max(0, parseInt(req.query.limit) || 20); //max to avoid -
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const users = await User.findAll({
      limit,
      offset, //skip
      order: [["id", "ASC"]],
    });

    res.json({ data: users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /users/:id
export const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

// POST /users
export const createUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof UniqueConstraintError)
      return res.status(409).json({ error: "Email already exists" });
    if (err instanceof ValidationError)
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors.map((e) => e.message),
      });
    throw err;
  }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const { name, email } = req.body;
    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    await user.save();
    res.json(user);
  } catch (err) {
    if (err instanceof UniqueConstraintError)
      return res.status(409).json({ error: "Email already exists" });
    if (err instanceof ValidationError)
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors.map((e) => e.message),
      });
    throw err;
  }
};

// DELETE /users/:id
export const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  await user.destroy();
  res.status(204).send();
};
