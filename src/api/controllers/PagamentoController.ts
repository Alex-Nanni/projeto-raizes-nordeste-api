import { Request, Response, NextFunction } from 'express';
import { PagamentoService } from '../../application/services/PagamentoService';

const pagamentoService = new PagamentoService();

export class PagamentoController {
  // POST /pagamentos/mock - Simular processamento de pagamento
    /**
     * @swagger
     * /pagamentos/mock:
     *   post:
     *     summary: Simula o processamento de um pagamento
     *     tags: [Pagamentos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - pedidoId
     *               - statusSimulado
     *             properties:
     *               pedidoId:
     *                 type: integer
     *               statusSimulado:
     *                 type: string
     *                 enum: [APROVADO, RECUSADO]
     *     responses:
     *       200:
     *         description: Pagamento processado
     *       401:
     *       404:
     *       409:
     *       422:
     */
  async processarMock(req: Request, res: Response, next: NextFunction) {
    try {
      const { pedidoId, statusSimulado } = req.body;
      const pedidoAtualizado = await pagamentoService.processarMock(pedidoId, statusSimulado);
      return res.status(200).json({
        mensagem: `Pagamento ${statusSimulado}. Status atualizado para ${pedidoAtualizado.status}.`,
        pedido: pedidoAtualizado,
      });
    } catch (error: any) {
      if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
        return res.status(404).json({
          error: 'PEDIDO_NAO_ENCONTRADO',
          message: 'Pedido não encontrado.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      if (error.message === 'STATUS_INVALIDO') {
        return res.status(409).json({
          error: 'STATUS_INVALIDO',
          message: 'Pedido não está aguardando pagamento.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      if (error.message === 'STATUS_SIMULADO_INVALIDO') {
        return res.status(422).json({
          error: 'VALIDACAO_FALHOU',
          message: 'statusSimulado deve ser APROVADO ou RECUSADO.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }
      next(error);
    }
  }
}