import { Request, Response } from 'express';
import User from '../models/user.models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password_hash: hashedPassword,
      created_at: new Date(),
    });

    await newUser.save();

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "1d" }
    );

    // ✅ Return token along with user info
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id,
      name: newUser.name,
      token: token,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("Generated token:", token); // <-- Print token to console

    // Send token in response
    return res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      name: user.name,
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};