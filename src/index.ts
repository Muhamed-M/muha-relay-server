import express from 'express';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';

const app = express();
const port = Bun.env.PORT || 5000;
app.use(express.json());
// Configure CORS
app.use(
  cors({
    origin: Bun.env.FRONTEND_CLIENT_URL, // Replace with your Nuxt frontend URL
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// <--- Routes --->
app.use(routes);

// error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
