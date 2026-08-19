import express from 'express';
import routes from './api/routes/routes';
import { errorHandler } from './api/middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Raízes do Nordeste rodando na porta ${PORT}`);
});