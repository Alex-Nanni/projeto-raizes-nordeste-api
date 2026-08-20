import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../infrastructure/database/prismaClient';

export class PagamentoController {
  // POST /pagamentos/mock - Simular processamento de pagamento
  async processarMock(req: Request, res: Response, next: NextFunction) {
    try {
      const { pedidoId, statusSimulado } = req.body;

      // 1. Validar se o pedido existe
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
      });

      if (!pedido) {
        return res.status(404).json({
          error: 'PEDIDO_NAO_ENCONTRADO',
          message: `Pedido com ID ${pedidoId} não encontrado.`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // 2. Validar se o pedido está no status correto
      if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
        return res.status(409).json({
          error: 'STATUS_INVALIDO',
          message: `O pedido está com status "${pedido.status}". Só é possível processar pagamento de pedidos em "AGUARDANDO_PAGAMENTO".`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // 3. Simular aprovação ou recusa
      if (statusSimulado !== 'APROVADO' && statusSimulado !== 'RECUSADO') {
        return res.status(422).json({
          error: 'VALIDACAO_FALHOU',
          message: 'O campo "statusSimulado" deve ser "APROVADO" ou "RECUSADO".',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const novoStatus = statusSimulado === 'APROVADO' ? 'PREPARANDO' : 'CANCELADO';

      // 4. Atualizar o status do pedido
      const pedidoAtualizado = await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: novoStatus },
        include: { itens: true, cliente: true, unidade: true },
      });

      return res.status(200).json({
        mensagem: `Pagamento ${statusSimulado}. Status do pedido atualizado para "${novoStatus}".`,
        pedido: pedidoAtualizado,
      });
    } catch (error) {
      next(error);
    }
  }
}