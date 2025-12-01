import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import musicianRoutes from './routes/musicians';
import tokenRoutes from './routes/tokens';
import governanceRoutes from './routes/governance';
import postRoutes from './routes/posts';

/**
 * Express Application Setup
 * T024: Core Express app configuration with error handling and middleware
 */

// Initialize Express app
const app: Express = express();

// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

// ============================================================
// 1. MIDDLEWARE CONFIGURATION
// ============================================================

// Trust proxy (important for deployments behind reverse proxies)
app.set('trust proxy', 1);

// CORS configuration - allow multiple localhost ports for development
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ============================================================
// 2. HEALTH CHECK ENDPOINT
// ============================================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ============================================================
// 3. API ROUTES
// ============================================================

// Musician routes
app.use('/api/musicians', musicianRoutes);

// Token purchase routes
app.use('/api/tokens', tokenRoutes);

// Governance routes
app.use('/api/governance', governanceRoutes);

// Posts routes
app.use('/api/posts', postRoutes);

// TODO: Implement additional routes
// app.use('/api/projects', projectRoutes);

// ============================================================
// 4. 404 HANDLER
// ============================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    type: 'https://fanding.dev/problems/not-found',
    title: 'Not Found',
    status: 404,
    detail: `The endpoint ${req.method} ${req.path} does not exist`,
    instance: req.originalUrl,
  });
});

// ============================================================
// 5. ERROR HANDLER MIDDLEWARE (must be last)
// ============================================================

/**
 * Global Error Handler
 * Implements RFC 9457 Problem Details for HTTP APIs
 */
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const timestamp = new Date().toISOString();

  // Log error details
  console.error(`[${timestamp}] Error (${statusCode}):`, message);
  if (NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Response according to RFC 9457
  const response: any = {
    type: err.type || `https://fanding.dev/problems/${statusCode}`,
    title: err.title || getErrorTitle(statusCode),
    status: statusCode,
    detail: message,
    instance: req.originalUrl,
    timestamp,
  };

  // Add additional properties if present
  if (err.code) {
    response.code = err.code;
  }
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
});

// ============================================================
// 6. HELPER FUNCTIONS
// ============================================================

function getErrorTitle(statusCode: number): string {
  const titles: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return titles[statusCode] || 'Unknown Error';
}

// ============================================================
// 7. SERVER STARTUP
// ============================================================

export function startServer() {
  app.listen(PORT, () => {
    console.log(`\n✨ Fanding Backend Server Started`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔐 CORS Origin: ${CORS_ORIGIN}\n`);
  });
}

export default app;
