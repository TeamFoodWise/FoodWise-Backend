import express, {Application} from 'express';
import bodyParser from 'body-parser';
import {routes} from './routes';
import cors from 'cors';

const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use('/api', routes);

export default app;
