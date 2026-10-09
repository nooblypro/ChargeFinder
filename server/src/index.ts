import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { stopsRouter } from './routes/stops.js';
import { directoryRouter } from './routes/directory.js';
import { frictionRouter } from './routes/friction.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/stops', stopsRouter);
app.use('/api/directory', directoryRouter);
app.use('/api/friction', frictionRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'ChargeSync India Aggregator Backend',
    corridor: 'Bengaluru–Mysuru Expressway (NH 275)',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`⚡ ChargeSync India Aggregator Backend Running`);
  console.log(`➜  URL: http://localhost:${PORT}`);
  console.log(`➜  Endpoint: GET http://localhost:${PORT}/api/stops/:stopId`);
  console.log(`➜  Cache: node-cache active (TTL 600s)`);
  console.log(`=================================================\n`);
});

export default app;
