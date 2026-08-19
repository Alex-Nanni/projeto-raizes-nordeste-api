import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const response = {
    error: err.name || 'ERRO_INTERNO_SERVIDOR',
    message: err.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    details: err.details || [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };
  res.status(status).json(response);
}