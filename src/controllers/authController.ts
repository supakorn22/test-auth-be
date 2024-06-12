import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, AuthenticatedRequest } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'; // Replace with your secret key, ideally from an environment variable

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, password, role } = req.body;

    try {
        if (!['admin', 'seller', 'customer'].includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user: IUser = new User({ username, password: hashedPassword, role });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        const user: IUser | null = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ error: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', token, {
            maxAge: 360000, // 6 minutes
            secure: false,
            httpOnly: true,
            sameSite: 'strict',
            domain: 'localhost',
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};

// Middleware to protect routes
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: Function): void => {
    const token = req.cookies.token;
    if (token == null) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

export const getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user: IUser | null = await User.findById(req.user.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Destructure the user object to separate the password from the rest of the user data
        const { password, ...userWithoutPassword } = user.toObject();

        res.send(userWithoutPassword);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req: Request, res: Response): void => {
    res.cookie('token', '', {
        maxAge: 0,  // Expire the cookie immediately
        secure: false,
        httpOnly: true
    });
    res.json({ message: 'Logged out successfully' });
};

// Middleware to check user role
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: Function) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
        }
        next();
    };
};
