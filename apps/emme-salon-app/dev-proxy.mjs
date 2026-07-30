import http from 'node:http';

// Service routing map: operation name → service URL
const ROUTES = {
  // auth-service
  clients: 'http://localhost:8082',
  client: 'http://localhost:8082',
  createClient: 'http://localhost:8082',
  updateClient: 'http://localhost:8082',
  deleteClient: 'http://localhost:8082',
  // appointment-service
  appointments: 'http://localhost:8083',
  createAppointment: 'http://localhost:8083',
  cancelAppointment: 'http://localhost:8083',
  rescheduleAppointment: 'http://localhost:8083',
  // nails-service
  nailServices: 'http://localhost:8090',
  nailArtists: 'http://localhost:8090',
  estimatePrice: 'http://localhost:8090',
  createNailService: 'http://localhost:8090',
  updateNailService: 'http://localhost:8090',
  deleteNailService: 'http://localhost:8090',
  // payment-service
  payments: 'http://localhost:8084',
  capturedPayments: 'http://localhost:8084',
};

const DEFAULT_SERVICE = 'http://localhost:8083';

function extractOperationName(body) {
  const match = body.match(/(?:query|mutation)\s+(\w+)/);
  return match ? match[1] : null;
}

function resolveTenantFromHost(host) {
  if (!host || host === 'localhost' || host.startsWith('127.0.0.1')) return null;
  if (host.endsWith('.lvh.me')) {
    const parts = host.split('.');
    return parts.length >= 3 ? parts[0] : null;
  }
  return null;
}

function buildProxyOptions(target, headers, tenantSlug) {
  const url = new URL(target);
  const proxyHeaders = {
    'Content-Type': 'application/json',
  };
  if (headers.authorization) {
    proxyHeaders.authorization = headers.authorization;
  }
  if (tenantSlug) {
    proxyHeaders['x-emme-tenant-slug'] = tenantSlug;
  }
  return {
    hostname: url.hostname,
    port: url.port || '80',
    path: '/graphql',
    method: 'POST',
    headers: proxyHeaders,
  };
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let target = DEFAULT_SERVICE;
    try {
      const operationName = extractOperationName(body);
      if (operationName && ROUTES[operationName]) {
        target = ROUTES[operationName];
      }
    } catch {
      // Keep default on parse failure
    }

    const host = req.headers.host || '';
    const tenantSlug = resolveTenantFromHost(host);
    if (tenantSlug) {
      console.log(`[Dev Proxy] Tenant: ${tenantSlug} → ${target}`);
    }

    const options = buildProxyOptions(target, req.headers, tenantSlug);

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Dev Proxy] Error -> ${target}: ${err.message}`);
      res.writeHead(502);
      res.end(JSON.stringify({ error: `Service unavailable: ${err.message}` }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

const PORT = 8099;
server.listen(PORT, () => {
  console.log(`[Dev Proxy] GraphQL router on http://localhost:${PORT}`);
  console.log(`[Dev Proxy] Routes:`, Object.keys(ROUTES).join(', '));
});
