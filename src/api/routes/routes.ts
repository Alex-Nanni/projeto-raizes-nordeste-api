import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { PedidoController } from '../controllers/PedidoController';
import { PagamentoController } from '../controllers/PagamentoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();
const pedidoController = new PedidoController();
const pagamentoController = new PagamentoController();

// Rota pública de autenticação
router.post('/auth/login', authController.login);

// Rotas protegidas (exigem JWT)
router.post('/pedidos', authMiddleware, pedidoController.criarPedido);
router.get('/pedidos', authMiddleware, pedidoController.listarPedidos);
router.post('/pagamentos/mock', authMiddleware, pagamentoController.processarMock);

export default router;