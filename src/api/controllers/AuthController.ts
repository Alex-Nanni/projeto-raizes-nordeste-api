import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prismaClient';
import { logAudit } from '../../infrastructure/logger/auditLogger';

export class AuthController {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Autentica um usuário e retorna um token JWT
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - senha
     *             properties:
     *               email:
     *                 type: string
     *               senha:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                 tokenType:
     *                   type: string
     *                 expiresIn:
     *                   type: integer
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                     nome:
     *                       type: string
     *                     perfil:
     *                       type: string
     *       401:
     *         description: Credenciais inválidas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErroPadrao'
     */
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    // 1. Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Credenciais inválidas. Verifique e-mail e senha.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    // 2. Validar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Credenciais inválidas. Verifique e-mail e senha.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }

    logAudit('LOGIN_SUCESSO', usuario.id, { email: usuario.email });

// 3. Gerar token JWT
    const secret: string = process.env.JWT_SECRET || 'fallback_secret_para_dev';
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil } as object,
    secret,
    { expiresIn: expiresIn } as jwt.SignOptions
    );

    return res.status(200).json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 86400, // 1 dia em segundos
      user: {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil,
      },
    });
  }
}