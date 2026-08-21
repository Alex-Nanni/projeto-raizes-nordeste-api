import { Request, Response, NextFunction } from 'express';
import { PedidoService } from '../../application/services/PedidoService';

const pedidoService = new PedidoService()

export class PedidoController {
  // POST /pedidos - Criar pedido (fluxo crítico)
    /**
     * @swagger
     * /pedidos:
     *   post:
     *     summary: Cria um novo pedido
     *     tags: [Pedidos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - clienteId
     *               - unidadeId
     *               - canalPedido
     *               - itens
     *             properties:
     *               clienteId:
     *                 type: integer
     *               unidadeId:
     *                 type: integer
     *               canalPedido:
     *                 type: string
     *                 enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
     *               itens:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     produtoId:
     *                       type: integer
     *                     quantidade:
     *                       type: integer
     *     responses:
     *       201:
     *         description: Pedido criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pedido'
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Produto não encontrado
     *       409:
     *         description: Estoque insuficiente
     *       422:
     *         description: canalPedido ausente ou inválido
     */
async criarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienteId, unidadeId, canalPedido, itens } = req.body;
      const pedido = await pedidoService.criarPedido({
        clienteId,
        unidadeId,
        canalPedido,
        itens,
      });
      return res.status(201).json(pedido);
    } catch (error: any) {
      // Mapear erros para status HTTP
      if (error.message === 'CANAL_INVALIDO') {
        return res.status(422).json({
          error: 'VALIDACAO_FALHOU',
          message: 'Canal inválido. Use APP, TOTEM, BALCAO, PICKUP, WEB.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      if (error.message === 'PRODUTO_NAO_ENCONTRADO') {
        return res.status(404).json({
          error: 'PRODUTO_NAO_ENCONTRADO',
          message: 'Produto não encontrado.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      if (error.message === 'ESTOQUE_INSUFICIENTE') {
        return res.status(409).json({
          error: 'ESTOQUE_INSUFICIENTE',
          message: 'Estoque insuficiente.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      next(error);
    }
  }
  

  // GET /pedidos - Listar pedidos com filtros (canal, status) e paginação
  /**
   * @swagger
   * /pedidos:
   *   get:
   *     summary: Lista pedidos com filtros e paginação
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: canalPedido
   *         schema:
   *           type: string
   *           enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
   *         description: Filtra pedidos por canal de atendimento
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [AGUARDANDO_PAGAMENTO, PREPARANDO, PRONTO, ENTREGUE, CANCELADO]
   *         description: Filtra pedidos por status
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Quantidade de itens por página
   *     responses:
   *       200:
   *         description: Lista de pedidos com paginação
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ListaPedidosResponse'
   *       401:
   *         description: Não autenticado (token inválido ou ausente)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErroPadrao'
   */
  async listarPedidos(req: Request, res: Response, next: NextFunction) {
    try {
      const { canalPedido, status, page, limit } = req.query;
      const result = await pedidoService.listarPedidos({
        canalPedido: canalPedido as any,
        status: status as any,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}