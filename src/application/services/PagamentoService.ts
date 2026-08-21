// src/application/services/PagamentoService.ts
import { prisma } from '../../infrastructure/database/prismaClient';
import { logAudit } from '../../infrastructure/logger/auditLogger';

export class PagamentoService {
  async processarMock(pedidoId: number, statusSimulado: 'APROVADO' | 'RECUSADO') {
    // 1. Verificar se pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });
    if (!pedido) {
      throw new Error('PEDIDO_NAO_ENCONTRADO');
    }

    // 2. Verificar status atual
    if (pedido.status !== 'AGUARDANDO_PAGAMENTO') {
      throw new Error('STATUS_INVALIDO');
    }

    // 3. Simular
    if (statusSimulado !== 'APROVADO' && statusSimulado !== 'RECUSADO') {
      throw new Error('STATUS_SIMULADO_INVALIDO');
    }

    const novoStatus = statusSimulado === 'APROVADO' ? 'PREPARANDO' : 'CANCELADO';

    // 4. Atualizar pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: novoStatus },
      include: { itens: true, cliente: true, unidade: true },
    });

    logAudit('PROCESSAR_PAGAMENTO', pedido.clienteId, {
      pedidoId: pedido.id,
      statusAntigo: pedido.status,
      statusNovo: novoStatus,
      statusSimulado,
    });

    return pedidoAtualizado;
  }
}