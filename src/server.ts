import { env } from './config/env';
import express from 'express';
import routes from './api/routes/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { setupSwagger } from './api/swagger';

const app = express();
app.use(express.json());
app.use('/api', routes);

setupSwagger(app);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
  console.log(`📚 Swagger disponível em http://localhost:${env.PORT}/api-docs`);
});