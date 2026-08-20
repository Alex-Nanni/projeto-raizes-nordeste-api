import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação não fornecido.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Formato de token inválido. Use Bearer <token>.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token inválido ou expirado.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
}