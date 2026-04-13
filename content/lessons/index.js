window.NginxLessonContent = [
  {
    id: 'mvp-01-welcome-page',
    chapter: 1,
    order: 1,
    status: 'interactive',
    title: 'Welcome Page Online',
    summary: 'Confirm that the default Nginx site can serve GET / through a real static file setup.',
    context: 'A test machine already has Nginx installed, but the home page is still unavailable. Make the default site respond correctly.',
    goals: [
      'Return HTTP 200 for GET /.',
      'Resolve the page through root + index instead of a hard-coded return.'
    ],
    topology: ['Browser', 'Nginx', 'Static Files'],
    sampleRequest: ['GET / HTTP/1.1', 'Host: example.local'],
    skills: ['nginx-welcome-page-health-check'],
    initialConfig: 'server {\n    listen 80;\n    root /srv/www/html;\n}'
  },
  {
    id: 'mvp-02-domain-redirect',
    chapter: 1,
    order: 2,
    status: 'interactive',
    title: 'Canonical Domain Redirect',
    summary: 'Normalize traffic from example.com to www.example.com with an explicit 301.',
    context: 'Product wants both example.com and www.example.com to work, but only the canonical host should serve content.',
    goals: [
      'Match requests by Host.',
      'Redirect example.com to www.example.com with 301.',
      'Keep the canonical host serving the real site.'
    ],
    topology: ['Browser', 'Nginx'],
    sampleRequest: ['GET / HTTP/1.1', 'Host: example.com'],
    skills: ['nginx-domain-redirect-best-practice', 'nginx-server-names-hash-tuning'],
    initialConfig: 'server {\n    listen 80;\n    server_name example.com www.example.com;\n    root /srv/www/site;\n    index index.html;\n}'
  },
  {
    id: 'mvp-03-location-match',
    chapter: 1,
    order: 3,
    status: 'interactive',
    title: 'Location Match Drill',
    summary: 'Route /api/* and /assets/* through different handlers and make the match visible.',
    context: 'Frontend assets and backend APIs live under the same host, but API traffic is falling into the wrong location.',
    goals: [
      'Route /api/users to an API handler.',
      'Keep /assets/app.js on the static path.',
      'Explain why location matching picked the final branch.'
    ],
    topology: ['Browser', 'Nginx', 'Static Files', 'API Mock'],
    sampleRequest: ['GET /api/users HTTP/1.1', 'Host: app.example.local'],
    skills: ['nginx-http-request-lifecycle', 'nginx-http-request-phase-handling'],
    initialConfig: 'upstream api_backend {\n    server 127.0.0.1:9100;\n}\n\nserver {\n    listen 80;\n    server_name app.example.local;\n    root /srv/www/site;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}'
  },
  {
    id: 'mvp-04-first-reverse-proxy',
    chapter: 1,
    order: 4,
    status: 'interactive',
    title: 'First Reverse Proxy',
    summary: 'Proxy /api/ traffic to an upstream while leaving the site root untouched.',
    context: 'Static assets are deployed, but /api/ must now forward to an application server.',
    goals: [
      'Create an upstream block.',
      'Proxy /api/health to the backend.',
      'Keep / serving the site.'
    ],
    topology: ['Browser', 'Nginx', 'Static Files', 'Backend'],
    sampleRequest: ['GET /api/health HTTP/1.1', 'Host: app.example.local'],
    skills: ['nginx-proxy-pass-uri-rewriting', 'nginx-upstream-load-balancer-implementation'],
    initialConfig: 'server {\n    listen 80;\n    server_name app.example.local;\n    root /srv/www/site;\n    index index.html;\n\n    location /api/ {\n        try_files $uri $uri/ =404;\n    }\n}'
  },
  {
    id: 'mvp-05-uri-rewrite',
    chapter: 1,
    order: 5,
    status: 'interactive',
    title: 'URI Rewrite Rules',
    summary: 'Strip /api/ before proxying so the upstream receives /users instead of /api/users.',
    context: 'The backend only accepts /users, but Nginx still forwards /api/users and causes 404 responses.',
    goals: [
      'Understand proxy_pass path behavior.',
      'Rewrite /api/users into /users before it reaches the backend.',
      'Avoid brittle, path-specific hacks.'
    ],
    topology: ['Browser', 'Nginx', 'Backend'],
    sampleRequest: ['GET /api/users HTTP/1.1', 'Host: api.example.local'],
    skills: ['nginx-proxy-pass-uri-rewriting'],
    initialConfig: 'upstream users_backend {\n    server 127.0.0.1:9002;\n}\n\nserver {\n    listen 80;\n    server_name api.example.local;\n\n    location /api/ {\n        proxy_pass http://users_backend;\n    }\n}'
  },
  {
    id: 'mvp-06-real-ip',
    chapter: 2,
    order: 1,
    status: 'interactive',
    title: 'Real Client IP Chain',
    summary: 'Forward client address information upstream without breaking a proxy chain.',
    context: 'The upstream app only sees the Nginx IP in its logs, so the team cannot trace the real client source.',
    goals: [
      'Send X-Forwarded-For correctly.',
      'Preserve the proxy chain.',
      'Keep Host forwarding intact.'
    ],
    topology: ['Browser', 'Nginx', 'Backend'],
    sampleRequest: ['GET /api/report HTTP/1.1', 'Host: api.example.local'],
    skills: ['nginx-proxy-set-header-empty-value-handling', 'nginx-real-client-ip-rewrite', 'nginx-proxy-embedded-variables'],
    initialConfig: 'upstream report_backend {\n    server 127.0.0.1:9101;\n}\n\nserver {\n    listen 80;\n    server_name api.example.local;\n\n    location /api/ {\n        proxy_pass http://report_backend;\n        proxy_set_header X-Forwarded-For $remote_addr;\n    }\n}'
  },
  {
    id: 'mvp-07-basic-auth',
    chapter: 2,
    order: 2,
    status: 'interactive',
    title: 'Basic Auth Gate',
    summary: 'Protect /admin/ with Basic Auth while leaving the public site open.',
    context: 'An admin panel must stay private during an internal launch window, but the site root should remain public.',
    goals: [
      'Add auth_basic on /admin/.',
      'Require credentials only for the protected location.',
      'Avoid protecting the entire site by accident.'
    ],
    topology: ['Browser', 'Nginx', 'Admin Files'],
    sampleRequest: ['GET /admin/ HTTP/1.1', 'Host: intranet.example.local'],
    skills: ['nginx-http-basic-auth-configuration'],
    initialConfig: 'server {\n    listen 80;\n    server_name intranet.example.local;\n    root /srv/www/intranet;\n    index index.html;\n    auth_basic "Restricted Area";\n    auth_basic_user_file /etc/nginx/.htpasswd;\n}'
  },
  {
    id: 'mvp-08-websocket-upgrade',
    chapter: 2,
    order: 3,
    status: 'interactive',
    title: 'WebSocket Upgrade Failure',
    summary: 'Fix a failed /chat/ handshake and keep the connection alive long enough for real-time traffic.',
    context: 'The frontend already connects to /chat/ through WebSocket, but the browser keeps reconnecting. Repair the handshake and connection lifetime.',
    goals: [
      'Return HTTP 101 for the handshake.',
      'Forward the required upgrade headers.',
      'Prevent premature disconnects by raising proxy_read_timeout.'
    ],
    topology: ['Browser', 'Nginx', 'Chat Service'],
    sampleRequest: ['GET /chat/ HTTP/1.1', 'Host: chat.example.local', 'Upgrade: websocket', 'Connection: Upgrade'],
    skills: ['nginx-websocket-proxy-configuration'],
    initialConfig: 'upstream chat_backend {\n    server 127.0.0.1:9001;\n}\n\nserver {\n    listen 80;\n    server_name chat.example.local;\n\n    location /chat/ {\n        proxy_pass http://chat_backend;\n    }\n}'
  },
  {
    id: 'mvp-09-buffering-tradeoffs',
    chapter: 2,
    order: 4,
    status: 'interactive',
    title: 'Buffering Tradeoffs',
    summary: 'Balance first-byte time and throughput across streaming and download endpoints.',
    context: 'A streaming endpoint needs a fast first byte, but large downloads should still keep good throughput.',
    goals: [
      'Disable buffering where streaming matters.',
      'Tune download buffering separately.',
      'Treat buffering as a tradeoff, not a universal speed switch.'
    ],
    topology: ['Browser', 'Nginx', 'Stream Upstream', 'Download Upstream'],
    sampleRequest: ['GET /stream/live HTTP/1.1', 'Host: media.example.local'],
    skills: ['nginx-response-buffering-control'],
    initialConfig: 'upstream stream_backend {\n    server 127.0.0.1:9200;\n}\n\nupstream download_backend {\n    server 127.0.0.1:9201;\n}\n\nserver {\n    listen 80;\n    server_name media.example.local;\n\n    location /stream/ {\n        proxy_pass http://stream_backend;\n    }\n\n    location /downloads/ {\n        proxy_pass http://download_backend;\n        proxy_buffering off;\n    }\n}'
  },
  {
    id: 'mvp-10-first-cache',
    chapter: 2,
    order: 5,
    status: 'interactive',
    title: 'First Cache Strategy',
    summary: 'Cache anonymous product detail requests while bypassing cache for logged-in traffic.',
    context: 'Product pages are hot, the upstream is overloaded, and authenticated traffic must never serve stale shared content.',
    goals: [
      'Define a cache path and cache zone.',
      'Cache anonymous requests only.',
      'Bypass cache when cookies indicate a logged-in session.'
    ],
    topology: ['Browser', 'Nginx', 'Cache Zone', 'Product Backend'],
    sampleRequest: ['GET /products/42 HTTP/1.1', 'Host: shop.example.local'],
    skills: ['proxy-cache-core-configuration-and-key-generation', 'nginx-proxy-cache-path-configuration'],
    initialConfig: 'upstream product_backend {\n    server 127.0.0.1:9300;\n}\n\nserver {\n    listen 80;\n    server_name shop.example.local;\n\n    location /products/ {\n        proxy_pass http://product_backend;\n    }\n}'
  }
];
