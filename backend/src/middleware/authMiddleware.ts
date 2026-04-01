import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (token) {
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, role: true },
            });

            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }

            req.user = { id: user.id, role: user.role };
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
            return;
        }
        next();
    };
};
