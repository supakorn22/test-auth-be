import { Request, Response } from 'express';
import { V4 } from 'paseto';
import User, { IUser, AuthenticatedRequest } from '../models/User';
import RefreshToken from '../models/RefreshToken'; // New model for refresh tokens
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
dotenv.config();

const SECRET_KEY_PUBLIC = process.env.V4_PUBLIC ?? 'error_public_key';
const SECRET_KEY_SECRET = process.env.V4_SECRET ?? 'error_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'refresh_secret_key';

const generateRefreshToken = async (userId: string) => {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await new RefreshToken({ token: refreshToken, userId }).save();
    return refreshToken;
};

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

        const payload = { id: user._id, role: user.role, exp: new Date(Date.now() + (60 * 60 * 1000)).toISOString() };
        const token = await V4.sign(payload, SECRET_KEY_SECRET);
        const refreshToken = await generateRefreshToken(user._id as string);

        res.cookie('token', token, {
            maxAge: 3600000, // 60 minutes
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
            domain: 'localhost',
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
            domain: 'localhost',
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    console.log('refreshToken');
    const  refreshToken  = req.cookies.refreshToken;
    console.log(refreshToken);

    if (!refreshToken) {
        res.status(401).json({ error: 'Access denied. No refresh token provided.' });
        return;
    }

    try {
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            res.status(401).json({ error: 'Invalid refresh token.' });
            return;
        }

        const user: IUser | null = await User.findById(storedToken.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found.' });
            return;
        }

        const payload = { id: user._id, role: user.role, exp: new Date(Date.now() + (60 * 60 * 1000)).toISOString() };
        const newToken = await V4.sign(payload, SECRET_KEY_SECRET);

        res.cookie('token', newToken, {
            maxAge: 3600000, // 60 minutes
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
            domain: 'localhost',
        });

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error refreshing token' });
    }
};

// Middleware to protect routes
export const authenticatePaseto = async (req: AuthenticatedRequest, res: Response, next: Function): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const payload = await V4.verify(token, SECRET_KEY_PUBLIC);
        req.user = payload; // Attach the decoded token to the request object
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

        const { password, ...userWithoutPassword } = user.toObject();

        res.send(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        await RefreshToken.findOneAndDelete({ token: refreshToken });
    }

    res.cookie('token', '', {
        maxAge: 0, // Expire the cookie immediately
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        domain: 'localhost',
    });

    res.cookie('refreshToken', '', {
        maxAge: 0, // Expire the cookie immediately
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        domain: 'localhost',
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
