import express from 'express';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';

const app = express();
const port = Bun.env.PORT || 5000;
app.use(express.json());

// <--- Routes --->
app.use(routes);

// error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
