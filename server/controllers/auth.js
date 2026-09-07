import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const token = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: passwordHash });
  res.status(201).json({ token: token(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: token(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
