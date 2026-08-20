import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../infrastructure/database/prismaClient';

export class PedidoController {
  // POST /pedidos - Criar pedido (fluxo crítico)
  async criarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const { clienteId, unidadeId, canalPedido, itens } = req.body;

      // 1. VALIDAÇÃO OBRIGATÓRIA: Multicanalidade (canalPedido)
      if (!canalPedido) {
        return res.status(422).json({
          error: 'VALIDACAO_FALHOU',
          message: 'O campo "canalPedido" é obrigatório. Valores: APP, TOTEM, BALCAO, PICKUP, WEB.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // 2. Validar se os canais permitidos
      const canaisPermitidos = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
      if (!canaisPermitidos.includes(canalPedido)) {
        return res.status(422).json({
          error: 'VALIDACAO_FALHOU',
          message: 'Valor inválido para "canalPedido". Use APP, TOTEM, BALCAO, PICKUP ou WEB.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      let valorTotal = 0;

      // 3. Validar estoque e calcular total
      for (const item of itens) {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
        });

        if (!produto) {
          return res.status(404).json({
            error: 'PRODUTO_NAO_ENCONTRADO',
            message: `Produto com ID ${item.produtoId} não encontrado.`,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
          });
        }

        const estoque = await prisma.estoque.findFirst({
          where: {
            unidadeId: unidadeId,
            produtoId: item.produtoId,
          },
        });

        if (!estoque || estoque.quantidade < item.quantidade) {
          return res.status(409).json({
            error: 'ESTOQUE_INSUFICIENTE',
            message: `Estoque insuficiente para o produto "${produto.nome}".`,
            details: [
              {
                field: 'produtoId',
                issue: `Disponível: ${estoque?.quantidade || 0}, Solicitado: ${item.quantidade}`,
              },
            ],
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
          });
        }

        valorTotal += produto.preco * item.quantidade;
      }

      // 4. Criar o pedido no banco de dados
      const novoPedido = await prisma.pedido.create({
        data: {
          clienteId,
          unidadeId,
          canalPedido,
          valorTotal,
          status: 'AGUARDANDO_PAGAMENTO',
          itens: {
            create: itens.map((i: any) => ({
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              precoUnitario: 0, // Será atualizado, mas deixamos 0 para simplificar
            })),
          },
        },
        include: {
          itens: true,
          cliente: true,
          unidade: true,
        },
      });

      return res.status(201).json(novoPedido);
    } catch (error) {
      next(error);
    }
  }

  // GET /pedidos - Listar pedidos com filtros (canal, status) e paginação
  async listarPedidos(req: Request, res: Response, next: NextFunction) {
    try {
      const { canalPedido, status, page = 1, limit = 10 } = req.query;

      const where: any = {};
      if (canalPedido) where.canalPedido = canalPedido;
      if (status) where.status = status;

      const skip = (Number(page) - 1) * Number(limit);

      const pedidos = await prisma.pedido.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          itens: true,
          cliente: true,
          unidade: true,
        },
        orderBy: { criadoEm: 'desc' },
      });

      const total = await prisma.pedido.count({ where });

      return res.status(200).json({
        data: pedidos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}