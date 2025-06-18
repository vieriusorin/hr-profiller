import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Create a Registry to store metrics
const register = new promClient.Registry();

// Enable the default metrics collection
promClient.collectDefaultMetrics({ register });

// Detailed Response Time Histogram with more granular buckets
const responseTimeHistogram = new promClient.Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Response Time Percentiles
const responseTimeSummary = new promClient.Summary({
  name: 'api_response_time_percentiles',
  help: 'API response time percentiles',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  registers: [register],
});

// Slow Request Counter
const slowRequestCounter = new promClient.Counter({
  name: 'api_slow_requests_total',
  help: 'Total number of slow API requests (over 1 second)',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  registers: [register],
});

// Request Processing Time Gauge
const requestProcessingTime = new promClient.Gauge({
  name: 'api_request_processing_time_seconds',
  help: 'Current request processing time in seconds',
  labelNames: ['method', 'route', 'endpoint'],
  registers: [register],
});

// HTTP Request Counter
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  registers: [register],
});

// Request Duration Histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Request Size Histogram
const httpRequestSize = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route', 'endpoint'],
  buckets: [100, 500, 1000, 5000, 10000],
  registers: [register],
});

// Response Size Histogram
const httpResponseSize = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status', 'endpoint'],
  buckets: [100, 500, 1000, 5000, 10000],
  registers: [register],
});

// Error Counter
const httpErrorCounter = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status', 'endpoint', 'error_type'],
  registers: [register],
});

// Active Requests Gauge
const activeRequests = new promClient.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests',
  labelNames: ['method', 'route', 'endpoint'],
  registers: [register],
});

export const logsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const route = req.route ? req.route.path : req.path;
  const endpoint = `${req.method} ${route}`;

  // Increment active requests
  activeRequests.inc({ method: req.method, route, endpoint });

  // Record request size
  const requestSize = req.headers['content-length']
    ? parseInt(req.headers['content-length'], 10)
    : 0;
  httpRequestSize.observe({ method: req.method, route, endpoint }, requestSize);

  // Start timing the request
  const timer = setInterval(() => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const elapsedTime = seconds + nanoseconds / 1e9;
    requestProcessingTime.set({ method: req.method, route, endpoint }, elapsedTime);
  }, 100); // Update every 100ms

  // Override end function to collect metrics
  const originalEnd = res.end;

  res.end = function (...args: any[]): any {
    // Clear the interval
    clearInterval(timer);

    // Calculate final duration
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;

    // Record detailed response time metrics
    responseTimeHistogram.observe(
      { method: req.method, route, status: res.statusCode, endpoint },
      duration
    );

    responseTimeSummary.observe(
      { method: req.method, route, status: res.statusCode, endpoint },
      duration
    );

    // Track slow requests
    if (duration > 1) {
      // Requests taking more than 1 second
      slowRequestCounter.inc({
        method: req.method,
        route,
        status: res.statusCode,
        endpoint,
      });
    }

    // Reset the processing time gauge
    requestProcessingTime.set({ method: req.method, route, endpoint }, 0);

    // Record metrics
    httpRequestCounter.inc({
      method: req.method,
      route,
      status: res.statusCode,
      endpoint,
    });

    httpRequestDuration.observe(
      { method: req.method, route, status: res.statusCode, endpoint },
      duration
    );

    const responseSize = args[0] ? Buffer.byteLength(args[0], args[1] as BufferEncoding) : 0;
    httpResponseSize.observe(
      { method: req.method, route, status: res.statusCode, endpoint },
      responseSize
    );

    // Record errors
    if (res.statusCode >= 400) {
      httpErrorCounter.inc({
        method: req.method,
        route,
        status: res.statusCode,
        endpoint,
        error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
      });
    }

    // Decrement active requests
    activeRequests.dec({ method: req.method, route, endpoint });

    // Call original end function
    //@ts-expect-error Error with originalEnd
    originalEnd.apply(res, args);
  };

  next();
};

// Export metrics endpoint handler
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating metrics', error);
    res.status(500).json({ error: 'Error generating metrics' });
  }
};

// Helper function to get response time statistics
export const getResponseTimeStats = async () => {
  const metrics = await register.getMetricsAsJSON();
  return metrics.filter(
    metric =>
      metric.name === 'api_response_time_seconds' || metric.name === 'api_response_time_percentiles'
  );
};
