import express from 'express';
import { registerUser, login } from '../controllers/auth.controller';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
router.post('/login', login);

export default router;