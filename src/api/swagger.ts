import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Rede Raízes do Nordeste',
      version: '1.0.0',
      description: 'API para gestão de pedidos, estoque e pagamentos da franquia.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErroPadrao: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
          },
        },
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clienteId: { type: 'integer' },
            unidadeId: { type: 'integer' },
            canalPedido: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
            status: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] },
            valorTotal: { type: 'number' },
            criadoEm: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/api/controllers/*.ts'], // Caminho dos arquivos com anotações
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}