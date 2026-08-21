// src/application/services/PedidoService.ts
import { prisma } from '../../infrastructure/database/prismaClient';
import { CanalPedido, StatusPedido } from '@prisma/client';
import { logAudit } from '../../infrastructure/logger/auditLogger';

export class PedidoService {
  async criarPedido(data: {
    clienteId: number;
    unidadeId: number;
    canalPedido: CanalPedido;
    itens: { produtoId: number; quantidade: number }[];
  }) {
    const { clienteId, unidadeId, canalPedido, itens } = data;

    // 1. Validar canalPedido
    const canaisPermitidos = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
    if (!canalPedido || !canaisPermitidos.includes(canalPedido)) {
      throw new Error('CANAL_INVALIDO');
    }

    // 2. Validar estoque e calcular total
    let valorTotal = 0;
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      });
      if (!produto) {
        throw new Error('PRODUTO_NAO_ENCONTRADO');
      }

      const estoque = await prisma.estoque.findFirst({
        where: {
          unidadeId: unidadeId,
          produtoId: item.produtoId,
        },
      });

      if (!estoque || estoque.quantidade < item.quantidade) {
        throw new Error('ESTOQUE_INSUFICIENTE');
      }

      valorTotal += produto.preco * item.quantidade;
    }

    // 3. Criar pedido
    const novoPedido = await prisma.pedido.create({
      data: {
        clienteId,
        unidadeId,
        canalPedido,
        valorTotal,
        status: 'AGUARDANDO_PAGAMENTO',
        itens: {
          create: itens.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: 0,
          })),
        },
      },
      include: { itens: true, cliente: true, unidade: true },
    });

    logAudit('CRIAR_PEDIDO', clienteId, { pedidoId: novoPedido.id, total: valorTotal });

    return novoPedido;
  }

  async listarPedidos(filtros: {
    canalPedido?: CanalPedido;
    status?: StatusPedido;
    page?: number;
    limit?: number;
  }) {
    const { canalPedido, status, page = 1, limit = 10 } = filtros;

    const where: any = {};
    if (canalPedido) where.canalPedido = canalPedido;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip,
        take,
        include: { itens: true, cliente: true, unidade: true },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.pedido.count({ where }),
    ]);

    return {
      data: pedidos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}