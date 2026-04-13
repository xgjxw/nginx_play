(function() {
  var LESSON_PROGRESS_KEY = 'nginx_learning_progress_v1';
  var booted = false;
  var screenGame = null;
  var lessonRoot = null;
  var currentLesson = null;
  var currentResult = null;
  var currentConfig = '';

  var LESSON_CHAPTERS = [
    {
      id: 1,
      name: 'Request Arrival',
      diff: 'easy',
      diffLabel: 'MVP',
      icon: 'RG',
      desc: 'Start with default sites, server matching, and request routing.'
    },
    {
      id: 2,
      name: 'Reverse Proxy',
      diff: 'medium',
      diffLabel: 'MVP',
      icon: 'RP',
      desc: 'Move into proxying, headers, auth, upgrades, and cache strategy.'
    }
  ];

  var LESSONS = [
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
      sampleRequest: [
        'GET / HTTP/1.1',
        'Host: example.local'
      ],
      skills: ['nginx-welcome-page-health-check'],
      initialConfig: [
        'server {',
        '    listen 80;',
        '    root /srv/www/html;',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET / HTTP/1.1',
        'Host: example.com'
      ],
      skills: ['nginx-domain-redirect-best-practice', 'nginx-server-names-hash-tuning'],
      initialConfig: [
        'server {',
        '    listen 80;',
        '    server_name example.com www.example.com;',
        '    root /srv/www/site;',
        '    index index.html;',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /api/users HTTP/1.1',
        'Host: app.example.local'
      ],
      skills: ['nginx-http-request-lifecycle', 'nginx-http-request-phase-handling'],
      initialConfig: [
        'upstream api_backend {',
        '    server 127.0.0.1:9100;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name app.example.local;',
        '    root /srv/www/site;',
        '    index index.html;',
        '',
        '    location / {',
        '        try_files $uri $uri/ /index.html;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /api/health HTTP/1.1',
        'Host: app.example.local'
      ],
      skills: ['nginx-proxy-pass-uri-rewriting', 'nginx-upstream-load-balancer-implementation'],
      initialConfig: [
        'server {',
        '    listen 80;',
        '    server_name app.example.local;',
        '    root /srv/www/site;',
        '    index index.html;',
        '',
        '    location /api/ {',
        '        try_files $uri $uri/ =404;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /api/users HTTP/1.1',
        'Host: api.example.local'
      ],
      skills: ['nginx-proxy-pass-uri-rewriting'],
      initialConfig: [
        'upstream users_backend {',
        '    server 127.0.0.1:9002;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name api.example.local;',
        '',
        '    location /api/ {',
        '        proxy_pass http://users_backend;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /api/report HTTP/1.1',
        'Host: api.example.local'
      ],
      skills: ['nginx-proxy-set-header-empty-value-handling', 'nginx-real-client-ip-rewrite', 'nginx-proxy-embedded-variables'],
      initialConfig: [
        'upstream report_backend {',
        '    server 127.0.0.1:9101;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name api.example.local;',
        '',
        '    location /api/ {',
        '        proxy_pass http://report_backend;',
        '        proxy_set_header X-Forwarded-For $remote_addr;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /admin/ HTTP/1.1',
        'Host: intranet.example.local'
      ],
      skills: ['nginx-http-basic-auth-configuration'],
      initialConfig: [
        'server {',
        '    listen 80;',
        '    server_name intranet.example.local;',
        '    root /srv/www/intranet;',
        '    index index.html;',
        '    auth_basic "Restricted Area";',
        '    auth_basic_user_file /etc/nginx/.htpasswd;',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /chat/ HTTP/1.1',
        'Host: chat.example.local',
        'Upgrade: websocket',
        'Connection: Upgrade'
      ],
      skills: ['nginx-websocket-proxy-configuration'],
      initialConfig: [
        'upstream chat_backend {',
        '    server 127.0.0.1:9001;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name chat.example.local;',
        '',
        '    location /chat/ {',
        '        proxy_pass http://chat_backend;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /stream/live HTTP/1.1',
        'Host: media.example.local'
      ],
      skills: ['nginx-response-buffering-control'],
      initialConfig: [
        'upstream stream_backend {',
        '    server 127.0.0.1:9200;',
        '}',
        '',
        'upstream download_backend {',
        '    server 127.0.0.1:9201;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name media.example.local;',
        '',
        '    location /stream/ {',
        '        proxy_pass http://stream_backend;',
        '    }',
        '',
        '    location /downloads/ {',
        '        proxy_pass http://download_backend;',
        '        proxy_buffering off;',
        '    }',
        '}'
      ].join('\n')
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
      sampleRequest: [
        'GET /products/42 HTTP/1.1',
        'Host: shop.example.local'
      ],
      skills: ['proxy-cache-core-configuration-and-key-generation', 'nginx-proxy-cache-path-configuration'],
      initialConfig: [
        'upstream product_backend {',
        '    server 127.0.0.1:9300;',
        '}',
        '',
        'server {',
        '    listen 80;',
        '    server_name shop.example.local;',
        '',
        '    location /products/ {',
        '        proxy_pass http://product_backend;',
        '    }',
        '}'
      ].join('\n')
    }
  ];

  var lessonMap = {};
  var contentLoadStarted = false;
  refreshLessonMap();

  function refreshLessonMap() {
    var i;
    lessonMap = {};
    for (i = 0; i < LESSONS.length; i++) {
      lessonMap[LESSONS[i].chapter + '_' + LESSONS[i].order] = LESSONS[i];
    }
  }

  function normalizeLessonRecord(raw) {
    if (!raw || !raw.id) return null;
    if (raw.scenario && raw.objectives && raw.explanation) {
      var topology = (raw.scenario.topology || []).map(function(node) {
        return node.label;
      });
      var firstTraffic = raw.scenario.trafficSamples && raw.scenario.trafficSamples[0];
      var sampleRequest = [];
      var headers = firstTraffic && firstTraffic.request && firstTraffic.request.headers ? firstTraffic.request.headers : {};
      var headerName;
      if (firstTraffic && firstTraffic.request) {
        sampleRequest.push((firstTraffic.request.method || 'GET') + ' ' + (firstTraffic.request.path || '/') + ' HTTP/1.1');
      }
      for (headerName in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, headerName)) sampleRequest.push(headerName + ': ' + headers[headerName]);
      }
      return {
        id: raw.id,
        chapter: raw.chapter,
        order: raw.order,
        status: raw.status || 'interactive',
        title: raw.title,
        summary: raw.summary,
        context: raw.scenario.businessContext || '',
        goals: (raw.objectives.mustPass || []).map(function(item) { return item.description; }),
        topology: topology,
        sampleRequest: sampleRequest,
        skills: raw.sourceSkills || [],
        initialConfig: raw.scenario.initialConfig || ''
      };
    }
    return raw;
  }

  function applyExternalLessonContent(records) {
    if (!records || !records.length) return;
    var normalized = records.map(normalizeLessonRecord).filter(Boolean);
    if (!normalized.length) return;
    LESSONS = normalized;
    refreshLessonMap();
    refreshVisibleLessonViews();
  }

  function loadLessonContent() {
    if (contentLoadStarted) return;
    contentLoadStarted = true;
    if (window.NginxLessonContent && window.NginxLessonContent.length) {
      applyExternalLessonContent(window.NginxLessonContent);
      return;
    }
    if (document.getElementById('lesson-content-script')) return;
    var script = document.createElement('script');
    script.id = 'lesson-content-script';
    script.src = './content/lessons/index.js';
    script.onload = function() {
      if (window.NginxLessonContent && window.NginxLessonContent.length) applyExternalLessonContent(window.NginxLessonContent);
    };
    document.body.appendChild(script);
  }

  function boot() {
    if (booted) return;
    if (!window.showScreen || !document.getElementById('screen-game')) return;
    booted = true;
    screenGame = document.getElementById('screen-game');
    injectStyles();
    ensureLessonRoot();
    window.renderChapterGrid = renderLessonChapterGrid;
    window.renderLevelGrid = renderLessonLevelGrid;
    window.startLevel = startLesson;
    loadLessonContent();
  }

  function injectStyles() {
    if (document.getElementById('lesson-mode-style')) return;
    var style = document.createElement('style');
    style.id = 'lesson-mode-style';
    style.textContent = [
      '#screen-game.lesson-mode-active .hud,',
      '#screen-game.lesson-mode-active #game-canvas,',
      '#screen-game.lesson-mode-active #particle-canvas,',
      '#screen-game.lesson-mode-active #sidebar,',
      '#screen-game.lesson-mode-active #config-panel,',
      '#screen-game.lesson-mode-active #wave-result { display: none !important; }',
      '#learning-mode-root { display: none; position: absolute; inset: 0; overflow: auto; padding: 24px; }',
      '#screen-game.lesson-mode-active #learning-mode-root { display: block; }',
      '.lesson-shell { max-width: 1400px; margin: 0 auto; display: grid; gap: 20px; }',
      '.lesson-hero { display: grid; gap: 10px; padding: 20px 24px; background: linear-gradient(160deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94)); border: 1px solid rgba(59,130,246,0.18); border-radius: 20px; box-shadow: 0 24px 50px rgba(2, 6, 23, 0.3); }',
      '.lesson-hero-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }',
      '.lesson-kicker { font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; color: #93c5fd; }',
      '.lesson-title { font-size: 2rem; font-weight: 800; color: #f8fafc; margin: 0; }',
      '.lesson-summary { color: #cbd5e1; line-height: 1.6; margin: 0; max-width: 980px; }',
      '.lesson-pill-row { display: flex; gap: 10px; flex-wrap: wrap; }',
      '.lesson-pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(148,163,184,0.18); background: rgba(15,23,42,0.75); color: #e2e8f0; font-size: 0.85rem; }',
      '.lesson-pill.good { border-color: rgba(16,185,129,0.4); color: #86efac; }',
      '.lesson-pill.warn { border-color: rgba(245,158,11,0.4); color: #fcd34d; }',
      '.lesson-grid { display: grid; grid-template-columns: 1.05fr 1.15fr; gap: 20px; }',
      '.lesson-stack { display: grid; gap: 20px; }',
      '.lesson-card { background: rgba(15,23,42,0.92); border: 1px solid rgba(59,130,246,0.14); border-radius: 18px; padding: 20px; box-shadow: 0 20px 40px rgba(2,6,23,0.22); }',
      '.lesson-card h3 { margin: 0 0 12px; font-size: 1.05rem; font-weight: 700; color: #f8fafc; }',
      '.lesson-card p { margin: 0; line-height: 1.65; color: #cbd5e1; }',
      '.lesson-chip-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }',
      '.lesson-chip { padding: 8px 12px; border-radius: 999px; background: rgba(30,41,59,0.95); border: 1px solid rgba(148,163,184,0.16); color: #e2e8f0; font-size: 0.84rem; }',
      '.lesson-list { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 10px; color: #e2e8f0; line-height: 1.55; }',
      '.lesson-label { margin-top: 16px; margin-bottom: 8px; color: #93c5fd; font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }',
      '.lesson-pre { margin: 10px 0 0; padding: 14px 16px; border-radius: 14px; background: #020617; border: 1px solid rgba(148,163,184,0.14); color: #e2e8f0; font: 0.9rem/1.55 Consolas, Menlo, Monaco, monospace; white-space: pre-wrap; word-break: break-word; }',
      '.lesson-log-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }',
      '.lesson-skill-links { display: grid; gap: 8px; margin-top: 12px; }',
      '.lesson-skill-links a { color: #93c5fd; text-decoration: none; }',
      '.lesson-skill-links a:hover { text-decoration: underline; }',
      '.lesson-textarea { width: 100%; min-height: 320px; resize: vertical; padding: 16px 18px; border-radius: 16px; border: 1px solid rgba(59,130,246,0.22); background: #020617; color: #f8fafc; font: 0.95rem/1.6 Consolas, Menlo, Monaco, monospace; }',
      '.lesson-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }',
      '.lesson-btn { appearance: none; border: 1px solid rgba(59,130,246,0.2); background: rgba(15,23,42,0.92); color: #e2e8f0; border-radius: 14px; padding: 12px 16px; cursor: pointer; font-size: 0.95rem; font-weight: 700; }',
      '.lesson-btn.primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #eff6ff; border-color: rgba(96,165,250,0.4); }',
      '.lesson-btn.success { background: linear-gradient(135deg, #059669, #047857); color: #ecfdf5; border-color: rgba(16,185,129,0.42); }',
      '.lesson-level-card { text-align: left; padding: 18px; display: grid; gap: 8px; min-height: 170px; }',
      '.lesson-level-card .level-num { font-size: 1rem; width: auto; height: auto; background: transparent; color: #93c5fd; justify-content: flex-start; }',
      '.lesson-level-title { font-size: 1.05rem; color: #f8fafc; font-weight: 800; line-height: 1.35; }',
      '.lesson-level-desc { font-size: 0.82rem; line-height: 1.55; color: #cbd5e1; }',
      '.lesson-status-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.08em; width: fit-content; }',
      '.lesson-status-chip.interactive { background: rgba(16,185,129,0.14); color: #86efac; border: 1px solid rgba(16,185,129,0.32); }',
      '.lesson-status-chip.scaffolded { background: rgba(245,158,11,0.12); color: #fcd34d; border: 1px solid rgba(245,158,11,0.28); }',
      '.chapter-card.lesson-chapter-card { min-height: 210px; justify-content: space-between; }',
      '@media (max-width: 1080px) { #learning-mode-root { padding: 16px; } .lesson-grid, .lesson-log-grid { grid-template-columns: 1fr; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureLessonRoot() {
    if (lessonRoot) return lessonRoot;
    lessonRoot = document.createElement('div');
    lessonRoot.id = 'learning-mode-root';
    screenGame.appendChild(lessonRoot);
    return lessonRoot;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getLessonProgress() {
    try {
      return JSON.parse(localStorage.getItem(LESSON_PROGRESS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLessonStars(lesson, stars) {
    var progress = getLessonProgress();
    progress[lesson.id] = Math.max(progress[lesson.id] || 0, stars || 0);
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));
  }

  function getSavedStars(lesson) {
    return getLessonProgress()[lesson.id] || 0;
  }

  function buildSkillLinks(skills) {
    return skills.map(function(skill) {
      return '<a href="./' + skill + '/SKILL.md" target="_blank" rel="noreferrer">' + escapeHtml(skill) + '</a>';
    }).join('');
  }

  function chapterLessons(chapterId) {
    return LESSONS.filter(function(lesson) {
      return lesson.chapter === chapterId;
    });
  }

  function getLesson(chapterId, levelNum) {
    return lessonMap[chapterId + '_' + levelNum] || null;
  }

  function refreshVisibleLessonViews() {
    var chapterGrid = document.getElementById('chapter-grid');
    var levelGrid = document.getElementById('level-grid');
    var title = document.getElementById('level-screen-title');
    if (chapterGrid && chapterGrid.children.length) renderLessonChapterGrid();
    if (levelGrid && title) {
      var match = String(title.textContent || '').match(/^Chapter\s+(\d+)/i);
      if (match) renderLessonLevelGrid(parseInt(match[1], 10));
    }
    if (currentLesson) {
      currentLesson = getLesson(currentLesson.chapter, currentLesson.order) || currentLesson;
      renderLesson();
    }
  }

  function getNextLesson(lesson) {
    var lessons = chapterLessons(lesson.chapter);
    if (lesson.order < lessons.length) return getLesson(lesson.chapter, lesson.order + 1);
    if (lesson.chapter < LESSON_CHAPTERS.length) return getLesson(lesson.chapter + 1, 1);
    return null;
  }

  function renderLessonChapterGrid() {
    var grid = document.getElementById('chapter-grid');
    if (!grid) return;
    grid.innerHTML = '';
    LESSON_CHAPTERS.forEach(function(chapter) {
      var card = document.createElement('div');
      card.className = 'chapter-card lesson-chapter-card';
      card.innerHTML =
        '<div class="chapter-num">Chapter ' + chapter.id + '</div>' +
        '<div class="chapter-name">' + escapeHtml(chapter.icon + ' ' + chapter.name) + '</div>' +
        '<div class="chapter-desc">' + escapeHtml(chapter.desc) + '</div>' +
        '<span class="chapter-diff diff-' + chapter.diff + '">' + escapeHtml(chapter.diffLabel) + '</span>';
      card.addEventListener('click', function() {
        showScreen('level');
        document.getElementById('level-screen-title').textContent = 'Chapter ' + chapter.id + ': ' + chapter.name;
        renderLessonLevelGrid(chapter.id);
      });
      grid.appendChild(card);
    });
  }

  function renderLessonLevelGrid(chapterId) {
    var grid = document.getElementById('level-grid');
    var lessons = chapterLessons(chapterId);
    if (!grid) return;
    grid.innerHTML = '';
    lessons.forEach(function(lesson) {
      var stars = getSavedStars(lesson);
      var starText = stars > 0 ? new Array(stars + 1).join('*') : 'Preview';
      var card = document.createElement('div');
      card.className = 'level-card lesson-level-card';
      card.innerHTML =
        '<div class="level-num">Lesson ' + lesson.order + '</div>' +
        '<div class="lesson-level-title">' + escapeHtml(lesson.title) + '</div>' +
        '<div class="lesson-status-chip ' + lesson.status + '">' + escapeHtml(lesson.status) + '</div>' +
        '<div class="level-stars">' + escapeHtml(starText) + '</div>' +
        '<div class="lesson-level-desc">' + escapeHtml(lesson.summary) + '</div>';
      card.addEventListener('click', function() {
        startLesson(lesson.chapter, lesson.order - 1);
      });
      grid.appendChild(card);
    });
  }

  function setLessonModeActive(active) {
    if (active) {
      screenGame.classList.add('lesson-mode-active');
      ensureLessonRoot();
      lessonRoot.style.display = 'block';
      if (window.G && G.frameId) {
        cancelAnimationFrame(G.frameId);
        G.frameId = null;
      }
      if (window.G) G.state = 'idle';
    } else {
      screenGame.classList.remove('lesson-mode-active');
      if (lessonRoot) lessonRoot.style.display = 'none';
    }
  }

  function renderLesson() {
    var lesson = currentLesson;
    var resultPill = currentResult ? (currentResult.completed ? 'Passed' : 'Needs work') : 'Not run';
    var resultTone = currentResult ? (currentResult.completed ? 'good' : 'warn') : '';
    var savedStars = getSavedStars(lesson);

    ensureLessonRoot();
    setLessonModeActive(true);
    lessonRoot.innerHTML =
      '<div class="lesson-shell">' +
        '<div class="lesson-hero">' +
          '<div class="lesson-hero-row">' +
            '<div>' +
              '<div class="lesson-kicker">Learning mission</div>' +
              '<h2 class="lesson-title">' + escapeHtml(lesson.title) + '</h2>' +
            '</div>' +
            '<div class="lesson-pill-row">' +
              '<span class="lesson-pill">Chapter ' + lesson.chapter + '</span>' +
              '<span class="lesson-pill">Lesson ' + lesson.order + '</span>' +
              '<span class="lesson-pill ' + resultTone + '">' + escapeHtml(resultPill) + '</span>' +
              '<span class="lesson-pill">' + escapeHtml(lesson.status) + '</span>' +
              '<span class="lesson-pill">Saved stars: ' + savedStars + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="lesson-summary">' + escapeHtml(lesson.summary) + '</p>' +
        '</div>' +
        '<div class="lesson-grid">' +
          '<div class="lesson-stack">' +
            '<section class="lesson-card">' +
              '<h3>Scenario</h3>' +
              '<p>' + escapeHtml(lesson.context) + '</p>' +
              '<div class="lesson-label">Topology</div>' +
              '<div class="lesson-chip-row">' + lesson.topology.map(function(item) { return '<span class="lesson-chip">' + escapeHtml(item) + '</span>'; }).join('') + '</div>' +
              '<div class="lesson-label">Goals</div>' +
              '<ul class="lesson-list">' + lesson.goals.map(function(goal) { return '<li>' + escapeHtml(goal) + '</li>'; }).join('') + '</ul>' +
              '<div class="lesson-label">Read next</div>' +
              '<div class="lesson-skill-links">' + buildSkillLinks(lesson.skills) + '</div>' +
            '</section>' +
            '<section class="lesson-card">' +
              '<h3>Sample Request</h3>' +
              '<pre class="lesson-pre">' + escapeHtml((lesson.sampleRequest || []).join('\n')) + '</pre>' +
              '<div class="lesson-label">Route Trace</div>' +
              '<pre class="lesson-pre">' + escapeHtml(renderRouteView()) + '</pre>' +
              '<div class="lesson-log-grid">' +
                '<div>' +
                  '<div class="lesson-label">Access Log</div>' +
                  '<pre class="lesson-pre">' + escapeHtml(renderAccessLog()) + '</pre>' +
                '</div>' +
                '<div>' +
                  '<div class="lesson-label">Error Log</div>' +
                  '<pre class="lesson-pre">' + escapeHtml(renderErrorLog()) + '</pre>' +
                '</div>' +
              '</div>' +
            '</section>' +
          '</div>' +
          '<div class="lesson-stack">' +
            '<section class="lesson-card">' +
              '<h3>' + (lesson.status === 'interactive' ? 'Config' : 'Scaffold') + '</h3>' +
              renderEditorArea(lesson) +
            '</section>' +
            '<section class="lesson-card">' +
              '<h3>Validation</h3>' +
              renderChecks() +
              renderMetrics() +
              '<div class="lesson-note">' + renderReviewNote(lesson) + '</div>' +
              '<div class="lesson-cta">' + renderCta(lesson) + '</div>' +
            '</section>' +
          '</div>' +
        '</div>' +
      '</div>';

    var editor = document.getElementById('lesson-config-editor');
    if (editor) {
      editor.value = currentConfig;
      editor.addEventListener('input', function() {
        currentConfig = editor.value;
      });
    }

    bindAction('lesson-back-button', function() {
      showScreen('level');
      renderLessonLevelGrid(lesson.chapter);
    });
    bindAction('lesson-reset-button', function() {
      currentConfig = lesson.initialConfig || '';
      currentResult = null;
      renderLesson();
    });
    bindAction('lesson-validate-button', function() {
      currentResult = runLessonValidation(lesson, currentConfig);
      if (currentResult.completed) saveLessonStars(lesson, currentResult.stars);
      renderLesson();
    });
    bindAction('lesson-next-button', function() {
      var nextLesson = getNextLesson(lesson);
      if (nextLesson) startLesson(nextLesson.chapter, nextLesson.order - 1);
      else {
        showScreen('chapter');
        renderLessonChapterGrid();
      }
    });
  }

  function bindAction(id, handler) {
    var node = document.getElementById(id);
    if (node) node.addEventListener('click', handler);
  }

  function renderEditorArea(lesson) {
    if (lesson.status !== 'interactive') {
      return '<p>This mission already has a scenario, goals, and reading list, but the simulator for it is not wired yet in this build.</p>' +
        '<div class="lesson-note">Use this screen to review the mission shape while the next validator is being implemented.</div>' +
        '<div class="lesson-actions"><button class="lesson-btn" id="lesson-back-button">Back to lessons</button></div>';
    }
    return '<textarea class="lesson-textarea" id="lesson-config-editor"></textarea>' +
      '<div class="lesson-actions">' +
        '<button class="lesson-btn primary" id="lesson-validate-button">Run checks</button>' +
        '<button class="lesson-btn" id="lesson-reset-button">Reset config</button>' +
        '<button class="lesson-btn" id="lesson-back-button">Back to lessons</button>' +
      '</div>';
  }

  function renderChecks() {
    if (!currentResult) return '<div class="lesson-note">Run the lesson checks to generate request traces, logs, and validator feedback.</div>';
    return '<div class="lesson-checks">' + currentResult.checks.map(function(check) {
      return '<div class="lesson-check ' + (check.passed ? 'pass' : 'fail') + '">' +
        '<div class="lesson-check-head"><span>' + escapeHtml(check.label) + '</span><span class="lesson-check-type">' + (check.required ? 'required' : 'bonus') + '</span></div>' +
        '<div class="lesson-check-detail">' + escapeHtml(check.detail) + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderMetrics() {
    if (!currentResult) return '';
    return '<div class="lesson-metrics">' + currentResult.metrics.map(function(metric) {
      return '<div class="lesson-metric"><div class="lesson-metric-label">' + escapeHtml(metric.label) + '</div><div class="lesson-metric-value">' + escapeHtml(metric.value) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderReviewNote(lesson) {
    if (!currentResult) {
      return lesson.status === 'interactive'
        ? 'The simulator does not run a real Nginx binary. It validates lesson-specific behavior from the config you write and then explains the request flow.'
        : 'This lesson is scaffolded only for now. The next step is wiring a validator and observability model for it.';
    }
    if (!currentResult.review || currentResult.review.length === 0) return 'The latest run finished without extra review notes.';
    return '<ul class="lesson-review-list">' + currentResult.review.map(function(note) {
      return '<li>' + escapeHtml(note) + '</li>';
    }).join('') + '</ul>';
  }

  function renderCta(lesson) {
    if (lesson.status !== 'interactive' || !currentResult || !currentResult.completed) return '';
    var nextLesson = getNextLesson(lesson);
    return '<button class="lesson-btn success" id="lesson-next-button">' + (nextLesson ? 'Next lesson' : 'Back to chapter map') + '</button>';
  }

  function renderRouteView() {
    return currentResult && currentResult.routeTrace ? currentResult.routeTrace.join('\n') : 'No route trace yet.';
  }

  function renderAccessLog() {
    return currentResult && currentResult.accessLog ? currentResult.accessLog.join('\n') : 'No access log yet.';
  }

  function renderErrorLog() {
    return currentResult && currentResult.errorLog ? currentResult.errorLog.join('\n') : 'No error log yet.';
  }

  function durationToSeconds(raw) {
    var match = String(raw || '').match(/^\s*(\d+)\s*(ms|s|m)?\s*$/i);
    if (!match) return 0;
    var value = parseInt(match[1], 10);
    var unit = (match[2] || 's').toLowerCase();
    if (unit === 'ms') return value / 1000;
    if (unit === 'm') return value * 60;
    return value;
  }

  function lineForDirective(config, directive) {
    var pattern = new RegExp('^\\s*' + directive + '\\s+([^;]+);', 'im');
    var match = String(config || '').match(pattern);
    return match ? match[1] : '';
  }

  function findLocationBlock(config, locationPath) {
    var escaped = locationPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var pattern = new RegExp('location\\s+(?:(?:=|\\^~|~\\*|~|@)\\s+)?' + escaped + '\\s*\\{([\\s\\S]*?)\\}', 'i');
    var match = String(config || '').match(pattern);
    return match ? match[1] : '';
  }

  function buildResult(stars, checks, routeTrace, accessLog, errorLog, metrics, review) {
    var completed = true;
    var j;
    for (j = 0; j < checks.length; j++) {
      if (checks[j].required && !checks[j].passed) {
        completed = false;
        break;
      }
    }
    return { completed: completed, stars: completed ? stars : 0, checks: checks, routeTrace: routeTrace, accessLog: accessLog, errorLog: errorLog, metrics: metrics, review: review };
  }

  function validateWelcomePage(config) {
    var hasServer = /server\s*\{/i.test(config);
    var hasListen = /listen\s+80\b[^;]*;/i.test(config);
    var hasRoot = /root\s+[^;]+;/i.test(config);
    var hasIndex = /index\s+[^;]+;/i.test(config);
    var hardCodedReturn = /return\s+200\b/i.test(config);
    var status = 404;
    var routeTrace = ['Browser -> Nginx'];
    var accessLog = [];
    var errorLog = [];
    var review = [];

    if (hardCodedReturn) {
      status = 200;
      routeTrace.push('server block -> return 200');
      review.push('The page reached HTTP 200, but the lesson expects root + index to resolve a real file.');
    } else if (hasServer && hasListen && hasRoot && hasIndex) {
      status = 200;
      routeTrace.push('server block -> root /srv/www/html -> index index.html');
      review.push('This matches the basic static-site flow: Nginx resolves / through the file system.');
    } else {
      routeTrace.push('server block -> missing root or index -> 404');
      if (!hasIndex) errorLog.push('open() "/srv/www/html/index.html" failed (2: No such file or directory)');
      if (!hasRoot) errorLog.push('no root was configured for the default server');
      review.push('A static site still needs both root and index to resolve / into a file-backed response.');
    }
    accessLog.push('127.0.0.1 - - "GET / HTTP/1.1" ' + status + ' 153 "-" "Lesson Simulator"');

    return buildResult(3,
      [
        { label: 'GET / returns HTTP 200', required: true, passed: status === 200, detail: status === 200 ? 'The request now reaches a successful response.' : 'The request still fails before the page can be served.' },
        { label: 'The page is resolved through root + index', required: true, passed: hasRoot && hasIndex && !hardCodedReturn, detail: (hasRoot && hasIndex && !hardCodedReturn) ? 'The page is file-backed instead of hard-coded.' : 'Avoid return 200 for this lesson. Add a real index directive so Nginx resolves a file.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Response', value: status + ' / ' + (status === 200 ? 'OK' : 'Not ready') },
        { label: 'Root', value: hasRoot ? 'Configured' : 'Missing' },
        { label: 'Index', value: hasIndex ? 'Configured' : 'Missing' },
        { label: 'Maintainability', value: hardCodedReturn ? 'Low' : 'Good' }
      ],
      review
    );
  }

  function validateDomainRedirect(config) {
    var redirectMatch = String(config || '').match(/server\s*\{[\s\S]*?server_name\s+example\.com\s*;[\s\S]*?return\s+301\s+([^;]+);[\s\S]*?\}/i);
    var redirectTarget = redirectMatch ? redirectMatch[1] : '';
    var hasRedirectServer = !!redirectMatch;
    var keepsPath = /\$request_uri\b/.test(redirectTarget);
    var canonicalServer = /server\s*\{[\s\S]*?server_name\s+www\.example\.com\s*;[\s\S]*?root\s+[^;]+;[\s\S]*?index\s+[^;]+;[\s\S]*?\}/i.test(config);
    var combinedHostsOnly = /server\s*\{[\s\S]*?server_name\s+[^;]*example\.com[^;]*www\.example\.com[^;]*;[\s\S]*?\}/i.test(config) && !hasRedirectServer;
    var redirectOk = hasRedirectServer && /www\.example\.com/i.test(redirectTarget);
    var apexStatus = redirectOk ? 301 : 200;
    var canonicalStatus = canonicalServer ? 200 : 404;
    var routeTrace = [
      'Browser(example.com) -> Nginx',
      redirectOk ? 'server_name example.com -> return 301 to canonical host' : 'server_name example.com -> canonical redirect is missing',
      'Browser(www.example.com) -> Nginx',
      canonicalServer ? 'server_name www.example.com -> root /srv/www/site -> index index.html' : 'server_name www.example.com -> site block is incomplete'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET / HTTP/1.1" ' + apexStatus + ' 0 "-" "Lesson Simulator"',
      '127.0.0.1 - - "GET / HTTP/1.1" ' + canonicalStatus + ' 153 "-" "Lesson Simulator"'
    ];
    var errorLog = [];
    var review = [];

    if (!hasRedirectServer) errorLog.push('example.com still lands in the content server because there is no dedicated redirect server block');
    if (hasRedirectServer && !/www\.example\.com/i.test(redirectTarget)) errorLog.push('the redirect target is not the canonical www.example.com host');
    if (!canonicalServer) errorLog.push('www.example.com does not have a site-serving server block with root and index');
    if (combinedHostsOnly) review.push('Putting both hosts in one server_name is not enough. Nginx still needs a dedicated server block to redirect the apex host.');
    if (redirectOk) review.push('The apex host now performs an explicit redirect before any site content is served.');
    if (canonicalServer) review.push('The canonical host still serves the real site instead of redirecting in a loop.');
    if (redirectOk && !keepsPath) review.push('The redirect works, but preserving $request_uri is the safer pattern for non-root requests.');

    return buildResult(redirectOk && canonicalServer ? (keepsPath ? 3 : 2) : 0,
      [
        { label: 'example.com redirects with HTTP 301', required: true, passed: redirectOk, detail: redirectOk ? 'The apex host now returns a permanent redirect to the canonical domain.' : 'Create a dedicated server block for example.com and return 301 to www.example.com.' },
        { label: 'www.example.com serves the site', required: true, passed: canonicalServer, detail: canonicalServer ? 'The canonical host still resolves a real site through root + index.' : 'Keep a separate content-serving server block for www.example.com.' },
        { label: 'Redirect preserves the request URI', required: false, passed: keepsPath, detail: keepsPath ? 'The redirect keeps the incoming path and query string.' : 'Consider appending $request_uri so deeper URLs stay intact.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Apex host', value: redirectOk ? '301 redirect' : 'Still serves content' },
        { label: 'Canonical host', value: canonicalServer ? '200 OK' : 'Not ready' },
        { label: 'Host split', value: hasRedirectServer ? 'Dedicated blocks' : 'Missing' },
        { label: 'URI preservation', value: keepsPath ? 'Enabled' : 'Basic' }
      ],
      review
    );
  }

  function validateFirstReverseProxy(config) {
    var locationBlock = findLocationBlock(config, '/api/');
    var hasUpstream = /upstream\s+app_backend\s*\{[\s\S]*?server\s+127\.0\.0\.1:9000\s*;[\s\S]*?\}/i.test(config);
    var hasProxyPass = /proxy_pass\s+http:\/\/app_backend\/?\s*;/i.test(locationBlock);
    var hasRoot = /root\s+[^;]+;/i.test(config);
    var hasIndex = /index\s+[^;]+;/i.test(config);
    var hostForward = /proxy_set_header\s+Host\s+\$host\s*;/i.test(locationBlock);
    var apiReady = hasUpstream && hasProxyPass;
    var siteReady = hasRoot && hasIndex;
    var apiStatus = apiReady ? 200 : 404;
    var siteStatus = siteReady ? 200 : 404;
    var routeTrace = [
      'Browser(/api/health) -> Nginx',
      apiReady ? 'location /api/ -> proxy_pass http://app_backend -> request forwarded to app_backend' : 'location /api/ -> static file logic -> API request never reaches the backend',
      'Browser(/) -> Nginx',
      siteReady ? 'server root -> index index.html' : 'site root is incomplete'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET /api/health HTTP/1.1" ' + apiStatus + ' 18 "-" "Lesson Simulator"',
      '127.0.0.1 - - "GET / HTTP/1.1" ' + siteStatus + ' 153 "-" "Lesson Simulator"'
    ];
    var errorLog = [];
    var review = [];

    if (!hasUpstream) errorLog.push('app_backend is missing, so Nginx has no upstream pool for /api/');
    if (hasUpstream && !hasProxyPass) errorLog.push('location /api/ still does not proxy traffic to app_backend');
    if (!siteReady) errorLog.push('the site root no longer resolves a static index page');
    if (apiReady) review.push('API traffic now leaves the static file path and reaches the application upstream.');
    else review.push('A reverse proxy needs two pieces: an upstream definition and a location that sends traffic into it.');
    if (siteReady) review.push('The site root remains file-backed, so / and /api/ no longer compete for the same handler.');
    if (!hostForward) review.push('Forwarding Host is not required for this lesson, but many apps rely on it once proxying is introduced.');

    return buildResult(apiReady && siteReady ? (hostForward ? 3 : 2) : 0,
      [
        { label: 'An upstream block exists for the app server', required: true, passed: hasUpstream, detail: hasUpstream ? 'Nginx now has a named upstream pool for backend traffic.' : 'Add upstream app_backend with the provided backend address.' },
        { label: '/api/health reaches the backend', required: true, passed: apiReady, detail: apiReady ? 'location /api/ now proxies requests to app_backend.' : 'Replace the static-file handler in /api/ with proxy_pass http://app_backend.' },
        { label: '/ still serves the site', required: true, passed: siteReady, detail: siteReady ? 'The root page remains a normal static site.' : 'Do not remove the root + index setup while adding the API proxy.' },
        { label: 'Host header is forwarded upstream', required: false, passed: hostForward, detail: hostForward ? 'The backend now receives the original Host value.' : 'Optional here, but adding proxy_set_header Host $host prepares the next lessons.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'API route', value: apiReady ? '200 proxied' : 'Not proxied' },
        { label: 'Site root', value: siteReady ? '200 static' : 'Broken' },
        { label: 'Upstream', value: hasUpstream ? 'Configured' : 'Missing' },
        { label: 'Host header', value: hostForward ? 'Forwarded' : 'Default only' }
      ],
      review
    );
  }

  function validateUriRewrite(config) {
    var locationBlock = findLocationBlock(config, '/api/');
    var hasUpstream = /upstream\s+users_backend\s*\{[\s\S]*?server\s+127\.0\.0\.1:9002\s*;[\s\S]*?\}/i.test(config);
    var trailingSlashProxy = /proxy_pass\s+http:\/\/users_backend\/\s*;/i.test(locationBlock);
    var genericRewrite = /rewrite\s+\^\/api\/\(\.\*\)\$\s+\/\$1\s+break\s*;/i.test(locationBlock) && /proxy_pass\s+http:\/\/users_backend\s*;/i.test(locationBlock);
    var hardCodedRewrite = /location\s*=\s*\/api\/users\s*\{/i.test(config) || /rewrite\s+\^?\/api\/users\b[^;]*\/users\b/i.test(locationBlock);
    var rewriteOk = hasUpstream && (trailingSlashProxy || genericRewrite);
    var backendPath = rewriteOk ? '/users' : '/api/users';
    var status = rewriteOk ? 200 : 404;
    var routeTrace = [
      'Browser(/api/users) -> Nginx',
      rewriteOk ? 'location /api/ -> strip /api prefix -> proxy_pass users_backend -> backend /users' : 'location /api/ -> proxy_pass users_backend -> backend /api/users -> 404'
    ];
    var accessLog = ['127.0.0.1 - - "GET /api/users HTTP/1.1" ' + status + ' 42 "-" "Lesson Simulator"'];
    var errorLog = [];
    var review = [];

    if (!hasUpstream) errorLog.push('users_backend is missing, so there is no backend target for /api/');
    if (hasUpstream && !rewriteOk) errorLog.push('the upstream still receives /api/users, but it only understands /users');
    if (rewriteOk) review.push('The backend now receives /users, which matches the API contract behind Nginx.');
    else review.push('proxy_pass path handling matters here. Without a rewrite or a trailing slash, Nginx forwards the /api prefix upstream.');
    if (hardCodedRewrite) review.push('Avoid a path-specific fix for /api/users. Use a generic /api/ rule so every endpoint follows the same rewrite behavior.');

    return buildResult(rewriteOk ? (hardCodedRewrite ? 2 : 3) : 0,
      [
        { label: '/api/users reaches the backend as /users', required: true, passed: rewriteOk, detail: rewriteOk ? 'The upstream path is now stripped correctly before proxying.' : 'Change proxy_pass behavior so /api/users becomes /users upstream.' },
        { label: 'The config targets the named upstream', required: true, passed: hasUpstream, detail: hasUpstream ? 'The users backend is still defined as a reusable upstream block.' : 'Keep an upstream users_backend block instead of hard-coding a one-off target.' },
        { label: 'The rewrite pattern is generic for /api/*', required: false, passed: !hardCodedRewrite, detail: !hardCodedRewrite ? 'The rule scales beyond a single endpoint.' : 'This fix works for one path only. Generalize it for all /api/* routes.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Backend path', value: backendPath },
        { label: 'Proxy style', value: trailingSlashProxy ? 'Trailing slash' : (genericRewrite ? 'rewrite + proxy_pass' : 'No rewrite') },
        { label: 'Upstream', value: hasUpstream ? 'Configured' : 'Missing' },
        { label: 'Robustness', value: hardCodedRewrite ? 'Path-specific' : 'Generic' }
      ],
      review
    );
  }

  function validateLocationMatch(config) {
    var apiBlock = findLocationBlock(config, '/api/');
    var assetsBlock = findLocationBlock(config, '/assets/');
    var hasUpstream = /upstream\s+api_backend\s*\{[\s\S]*?server\s+127\.0\.0\.1:9100\s*;[\s\S]*?\}/i.test(config);
    var apiProxy = /proxy_pass\s+http:\/\/api_backend\/?\s*;/i.test(apiBlock);
    var assetStatic = /(?:root|alias)\s+[^;]+;/i.test(assetsBlock) || /try_files\s+\$uri\b/i.test(assetsBlock);
    var explicitPrefix = /location\s+\^~\s+\/api\//i.test(config) || /location\s+\^~\s+\/assets\//i.test(config);
    var apiStatus = hasUpstream && apiProxy ? 200 : 404;
    var assetStatus = assetStatic ? 200 : 404;
    var routeTrace = [
      'Browser(/api/users) -> Nginx',
      hasUpstream && apiProxy ? 'location /api/ wins over location / because the longer prefix matches the request path' : 'location /api/ is missing or incomplete, so the request falls back to the wrong handler',
      'Browser(/assets/app.js) -> Nginx',
      assetStatic ? 'location /assets/ serves the static asset path directly' : 'the asset path is not isolated, so it falls back to a generic handler'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET /api/users HTTP/1.1" ' + apiStatus + ' 72 "-" "Lesson Simulator"',
      '127.0.0.1 - - "GET /assets/app.js HTTP/1.1" ' + assetStatus + ' 4096 "-" "Lesson Simulator"'
    ];
    var errorLog = [];
    var review = [];

    if (!hasUpstream) errorLog.push('api_backend is missing, so /api/users has no API upstream target');
    if (hasUpstream && !apiProxy) errorLog.push('location /api/ still does not proxy requests to api_backend');
    if (!assetStatic) errorLog.push('assets are not pinned to a dedicated static location');
    if (hasUpstream && apiProxy) review.push('The API request now follows the /api/ branch instead of falling into the generic site handler.');
    else review.push('In Nginx, location / does not beat a longer prefix. You still need to define the longer /api/ branch correctly.');
    if (assetStatic) review.push('Static assets now stay on a dedicated path instead of sharing the API route.');
    if (!explicitPrefix) review.push('The lesson passes without ^~, but adding explicit prefix matching makes the route choice easier to read for beginners.');

    return buildResult(hasUpstream && apiProxy && assetStatic ? (explicitPrefix ? 3 : 2) : 0,
      [
        { label: '/api/users reaches the API handler', required: true, passed: hasUpstream && apiProxy, detail: hasUpstream && apiProxy ? 'The API path now matches a dedicated proxy location.' : 'Add location /api/ and send it to api_backend.' },
        { label: '/assets/app.js stays on the static path', required: true, passed: assetStatic, detail: assetStatic ? 'Static assets now have a dedicated location branch.' : 'Add a /assets/ location with static file handling.' },
        { label: 'The route choice is made explicit', required: false, passed: explicitPrefix, detail: explicitPrefix ? 'The config uses an explicit prefix match for one of the dedicated branches.' : 'Optional: use ^~ to make the route choice clearer while learning.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'API request', value: hasUpstream && apiProxy ? 'Matched /api/' : 'Wrong branch' },
        { label: 'Asset request', value: assetStatic ? 'Matched /assets/' : 'Fallback only' },
        { label: 'Prefix clarity', value: explicitPrefix ? 'Explicit' : 'Implicit' },
        { label: 'Concept', value: 'Longest prefix wins' }
      ],
      review
    );
  }

  function validateRealIp(config) {
    var locationBlock = findLocationBlock(config, '/api/');
    var hasProxyPass = /proxy_pass\s+http:\/\/report_backend\/?\s*;/i.test(locationBlock);
    var hostForward = /proxy_set_header\s+Host\s+\$host\s*;/i.test(locationBlock);
    var xffChain = /proxy_set_header\s+X-Forwarded-For\s+\$proxy_add_x_forwarded_for\s*;/i.test(locationBlock);
    var xReal = /proxy_set_header\s+X-Real-IP\s+\$remote_addr\s*;/i.test(locationBlock);
    var backendXff = xffChain ? '203.0.113.8, 10.0.0.5' : (/proxy_set_header\s+X-Forwarded-For\s+\$remote_addr\s*;/i.test(locationBlock) ? '10.0.0.5' : 'Missing');
    var backendHost = hostForward ? 'api.example.local' : 'report_backend';
    var status = hasProxyPass && xffChain && hostForward ? 200 : 502;
    var routeTrace = [
      'Client 203.0.113.8 -> Edge proxy 10.0.0.5 -> Nginx',
      hasProxyPass ? 'location /api/ -> report_backend' : 'request never reaches report_backend correctly',
      'Upstream sees Host=' + backendHost + ' and X-Forwarded-For=' + backendXff
    ];
    var accessLog = ['10.0.0.5 - - "GET /api/report HTTP/1.1" ' + status + ' 128 "-" "Lesson Simulator"'];
    var errorLog = [];
    var review = [];

    if (!hasProxyPass) errorLog.push('report_backend is not wired to location /api/');
    if (!xffChain) errorLog.push('X-Forwarded-For is not using $proxy_add_x_forwarded_for, so the proxy chain is lost');
    if (!hostForward) errorLog.push('Host is not forwarded, so the upstream sees the wrong host value');
    if (xffChain) review.push('Using $proxy_add_x_forwarded_for preserves the incoming chain instead of overwriting it.');
    else review.push('Do not replace X-Forwarded-For with a single IP. Append to the existing chain.');
    if (hostForward) review.push('The upstream now receives the original Host header, which many applications depend on.');
    if (!xReal) review.push('Adding X-Real-IP is optional here, but many teams include it alongside X-Forwarded-For for easier debugging.');

    return buildResult(hasProxyPass && xffChain && hostForward ? (xReal ? 3 : 2) : 0,
      [
        { label: 'The upstream receives a preserved X-Forwarded-For chain', required: true, passed: xffChain, detail: xffChain ? 'The request keeps the original client chain intact.' : 'Use proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for.' },
        { label: 'The upstream receives the original Host header', required: true, passed: hostForward, detail: hostForward ? 'Host is now forwarded explicitly.' : 'Add proxy_set_header Host $host so the backend sees the public hostname.' },
        { label: 'A direct client-IP header is also forwarded', required: false, passed: xReal, detail: xReal ? 'X-Real-IP is available for quick debugging.' : 'Optional: add proxy_set_header X-Real-IP $remote_addr for easier log inspection.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Upstream status', value: status === 200 ? '200 OK' : 'Header chain broken' },
        { label: 'XFF at backend', value: backendXff },
        { label: 'Host at backend', value: backendHost },
        { label: 'Real-IP header', value: xReal ? 'Present' : 'Missing' }
      ],
      review
    );
  }

  function validateBasicAuth(config) {
    var adminBlock = findLocationBlock(config, '/admin/');
    var protectedAdmin = /auth_basic\s+(?!off\b)[^;]+;/i.test(adminBlock) && /auth_basic_user_file\s+[^;]+;/i.test(adminBlock);
    var configWithoutAdmin = String(config || '').replace(/location\s+(?:(?:=|\^~|~\*|~|@)\s+)?\/admin\/\s*\{[\s\S]*?\}/i, '');
    var serverWideAuth = /auth_basic\s+(?!off\b)[^;]+;/i.test(configWithoutAdmin);
    var publicSiteReady = /root\s+[^;]+;/i.test(config) && /index\s+[^;]+;/i.test(config) && !serverWideAuth;
    var namedRealm = /auth_basic\s+["'][^"']+["']\s*;/i.test(adminBlock);
    var adminStatus = protectedAdmin ? 401 : 200;
    var publicStatus = publicSiteReady ? 200 : 401;
    var routeTrace = [
      'Browser(/admin/) -> Nginx',
      protectedAdmin ? 'location /admin/ challenges with Basic Auth before serving the admin page' : '/admin/ is not protected by a dedicated auth gate',
      'Browser(/) -> Nginx',
      publicSiteReady ? 'public root stays open and serves index.html' : 'public root is still gated by auth or missing static config'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET /admin/ HTTP/1.1" ' + adminStatus + ' 0 "-" "Lesson Simulator"',
      '127.0.0.1 - - "GET / HTTP/1.1" ' + publicStatus + ' 153 "-" "Lesson Simulator"'
    ];
    var errorLog = [];
    var review = [];

    if (!protectedAdmin) errorLog.push('/admin/ is missing auth_basic or auth_basic_user_file');
    if (serverWideAuth) errorLog.push('auth_basic is enabled outside /admin/, so the public site is locked too');
    if (!publicSiteReady) errorLog.push('the public site no longer serves the root page without credentials');
    if (protectedAdmin) review.push('The admin path is now gated by an explicit 401 challenge.');
    else review.push('Protect /admin/ at the location level. Do not rely on a site-wide gate for this lesson.');
    if (publicSiteReady) review.push('The public root remains open, which is the real requirement for this rollout.');
    if (!namedRealm) review.push('A custom auth_basic realm string is optional, but it helps users understand what they are authenticating against.');

    return buildResult(protectedAdmin && publicSiteReady ? (namedRealm ? 3 : 2) : 0,
      [
        { label: '/admin/ requires Basic Auth', required: true, passed: protectedAdmin, detail: protectedAdmin ? 'The admin path now returns a proper Basic Auth challenge.' : 'Add auth_basic and auth_basic_user_file inside location /admin/.' },
        { label: '/ stays public', required: true, passed: publicSiteReady, detail: publicSiteReady ? 'The site root remains public and file-backed.' : 'Do not put auth_basic on the whole server block for this lesson.' },
        { label: 'The auth realm is named clearly', required: false, passed: namedRealm, detail: namedRealm ? 'The auth challenge includes a readable realm label.' : 'Optional: use a clear auth_basic realm string for a better operator experience.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Admin path', value: protectedAdmin ? '401 challenge' : 'Unprotected' },
        { label: 'Public root', value: publicSiteReady ? '200 public' : 'Still gated' },
        { label: 'Auth scope', value: serverWideAuth ? 'Too broad' : 'Scoped to /admin/' },
        { label: 'Realm', value: namedRealm ? 'Named' : 'Basic default' }
      ],
      review
    );
  }

  function validateBuffering(config) {
    var streamBlock = findLocationBlock(config, '/stream/');
    var downloadBlock = findLocationBlock(config, '/downloads/');
    var streamProxy = /proxy_pass\s+http:\/\/stream_backend\/?\s*;/i.test(streamBlock);
    var downloadProxy = /proxy_pass\s+http:\/\/download_backend\/?\s*;/i.test(downloadBlock);
    var streamUnbuffered = /proxy_buffering\s+off\s*;/i.test(streamBlock);
    var downloadBuffered = downloadProxy && !/proxy_buffering\s+off\s*;/i.test(downloadBlock);
    var downloadTuned = /proxy_buffers\s+\d+\s+\d+[kKmM]?\s*;/i.test(downloadBlock) || /proxy_buffer_size\s+\d+[kKmM]?\s*;/i.test(downloadBlock);
    var streamFirstByte = streamUnbuffered ? '45ms' : '220ms';
    var downloadThroughput = downloadBuffered ? '118 MB/s' : '52 MB/s';
    var routeTrace = [
      'Browser(/stream/live) -> Nginx -> stream_backend',
      streamUnbuffered ? 'response bytes are flushed early for low first-byte latency' : 'response is buffered before enough data is released to the client',
      'Browser(/downloads/archive.zip) -> Nginx -> download_backend',
      downloadBuffered ? 'download stays buffered for better bulk transfer throughput' : 'download buffering is disabled, so throughput suffers'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET /stream/live HTTP/1.1" ' + (streamProxy ? 200 : 502) + ' 8192 "-" "Lesson Simulator"',
      '127.0.0.1 - - "GET /downloads/archive.zip HTTP/1.1" ' + (downloadProxy ? 200 : 502) + ' 1048576 "-" "Lesson Simulator"'
    ];
    var errorLog = [];
    var review = [];

    if (!streamProxy) errorLog.push('/stream/ is not proxying to stream_backend');
    if (!downloadProxy) errorLog.push('/downloads/ is not proxying to download_backend');
    if (!streamUnbuffered) errorLog.push('streaming still uses buffered proxying, so the first byte arrives too late');
    if (!downloadBuffered) errorLog.push('downloads still run unbuffered, so overall throughput drops');
    if (streamUnbuffered) review.push('Streaming traffic now favors first-byte latency by disabling proxy_buffering.');
    else review.push('For live or streaming endpoints, buffering can delay visible output even if throughput looks fine.');
    if (downloadBuffered) review.push('Large downloads now keep buffering, which is usually the better tradeoff for throughput.');
    if (!downloadTuned) review.push('Explicit buffer sizing is optional here, but adding proxy_buffers or proxy_buffer_size makes the download path easier to tune later.');

    return buildResult(streamProxy && downloadProxy && streamUnbuffered && downloadBuffered ? (downloadTuned ? 3 : 2) : 0,
      [
        { label: '/stream/ is optimized for low first-byte latency', required: true, passed: streamProxy && streamUnbuffered, detail: streamProxy && streamUnbuffered ? 'Streaming now disables proxy buffering.' : 'Turn proxy_buffering off inside location /stream/.' },
        { label: '/downloads/ keeps buffering for throughput', required: true, passed: downloadProxy && downloadBuffered, detail: downloadProxy && downloadBuffered ? 'Downloads now keep a buffered transfer path.' : 'Do not disable proxy_buffering on the download path.' },
        { label: 'The download path has explicit buffer tuning', required: false, passed: downloadTuned, detail: downloadTuned ? 'The download path includes explicit buffer sizing.' : 'Optional: add proxy_buffers or proxy_buffer_size to make download tuning visible.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Stream first byte', value: streamFirstByte },
        { label: 'Download throughput', value: downloadThroughput },
        { label: 'Stream buffering', value: streamUnbuffered ? 'Off' : 'On' },
        { label: 'Download tuning', value: downloadTuned ? 'Explicit' : 'Default only' }
      ],
      review
    );
  }

  function validateCache(config) {
    var locationBlock = findLocationBlock(config, '/products/');
    var hasCachePath = /proxy_cache_path\s+[^;]+keys_zone=product_cache:\d+[kKmM]?\s*;/i.test(config);
    var hasProxyPass = /proxy_pass\s+http:\/\/product_backend\/?\s*;/i.test(locationBlock);
    var hasCache = /proxy_cache\s+product_cache\s*;/i.test(locationBlock);
    var hasCacheValid = /proxy_cache_valid\s+200\b[^;]*;/i.test(locationBlock);
    var mapSkip = /\bmap\s+\$http_cookie\s+\$skip_cache\b/i.test(config);
    var bypass = /proxy_cache_bypass\s+(?:\$skip_cache|\$http_cookie|\$cookie_[a-z0-9_]+)\s*;/i.test(locationBlock);
    var noCache = /proxy_no_cache\s+(?:\$skip_cache|\$http_cookie|\$cookie_[a-z0-9_]+)\s*;/i.test(locationBlock);
    var cacheHeader = /add_header\s+X-Cache-Status\s+\$upstream_cache_status\b/i.test(locationBlock);
    var anonymousCacheWorks = hasCachePath && hasProxyPass && hasCache && hasCacheValid;
    var loggedInBypass = bypass && noCache;
    var routeTrace = [
      'Anonymous GET /products/42 -> Nginx',
      anonymousCacheWorks ? 'first request MISS -> second request HIT from product_cache' : 'request goes straight to product_backend every time',
      'Logged-in GET /products/42 with Cookie=session=abc -> Nginx',
      loggedInBypass ? 'request bypasses shared cache and goes to product_backend' : 'request risks shared-cache pollution because bypass logic is missing'
    ];
    var accessLog = [
      '127.0.0.1 - - "GET /products/42 HTTP/1.1" ' + (hasProxyPass ? 200 : 502) + ' 5120 "-" "Lesson Simulator" cache=MISS',
      '127.0.0.1 - - "GET /products/42 HTTP/1.1" ' + (anonymousCacheWorks ? 200 : 502) + ' 5120 "-" "Lesson Simulator" cache=' + (anonymousCacheWorks ? 'HIT' : 'MISS'),
      '127.0.0.1 - - "GET /products/42 HTTP/1.1" ' + (hasProxyPass ? 200 : 502) + ' 5120 "-" "Lesson Simulator" cache=' + (loggedInBypass ? 'BYPASS' : 'MISS')
    ];
    var errorLog = [];
    var review = [];

    if (!hasCachePath) errorLog.push('proxy_cache_path is missing, so the cache zone does not exist');
    if (!hasProxyPass) errorLog.push('/products/ is not proxying to product_backend');
    if (hasProxyPass && !hasCache) errorLog.push('proxy_cache product_cache is missing on the products location');
    if (hasCache && !hasCacheValid) errorLog.push('cache validity is not defined for successful upstream responses');
    if (!loggedInBypass) errorLog.push('logged-in requests still risk entering or reading shared cache because bypass directives are incomplete');
    if (anonymousCacheWorks) review.push('Anonymous product requests now warm and hit the shared cache zone.');
    else review.push('A working cache needs both a cache zone and a location that actually uses it.');
    if (loggedInBypass) review.push('Logged-in traffic now avoids the shared cache, which protects personalized content.');
    else review.push('Caching is a business rule, not a blanket performance switch. Session-bearing traffic needs an explicit bypass path.');
    if (!mapSkip) review.push('A direct cookie-based bypass works, but a map on $http_cookie is the cleaner long-term pattern.');

    return buildResult(anonymousCacheWorks && loggedInBypass ? (mapSkip && cacheHeader ? 3 : 2) : 0,
      [
        { label: 'Anonymous product requests are cached', required: true, passed: anonymousCacheWorks, detail: anonymousCacheWorks ? 'The products location now uses a defined cache zone for successful responses.' : 'Add proxy_cache_path, proxy_cache product_cache, and a cache validity rule.' },
        { label: 'Logged-in requests bypass shared cache', required: true, passed: loggedInBypass, detail: loggedInBypass ? 'Session-bearing traffic now bypasses and skips cache writes.' : 'Add both proxy_cache_bypass and proxy_no_cache for logged-in traffic.' },
        { label: 'Cache behavior is observable', required: false, passed: cacheHeader || mapSkip, detail: cacheHeader ? 'The response exposes cache status for quick verification.' : (mapSkip ? 'A map-based skip flag is present even without a debug header.' : 'Optional: add a map-based skip flag or X-Cache-Status header for easier debugging.') }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Anonymous cache', value: anonymousCacheWorks ? 'MISS -> HIT' : 'Not ready' },
        { label: 'Logged-in request', value: loggedInBypass ? 'BYPASS' : 'Shared-cache risk' },
        { label: 'Cache zone', value: hasCachePath ? 'product_cache' : 'Missing' },
        { label: 'Observability', value: cacheHeader ? 'Header + metrics' : (mapSkip ? 'Map only' : 'Low') }
      ],
      review
    );
  }

  function validateWebSocket(config) {
    var locationBlock = findLocationBlock(config, '/chat/');
    var target = locationBlock || config;
    var hasProxyPass = /proxy_pass\s+http:\/\/chat_backend\b[^;]*;/i.test(target);
    var hasHttp11 = /proxy_http_version\s+1\.1\s*;/i.test(target);
    var hasUpgrade = /proxy_set_header\s+Upgrade\s+(?:\$http_upgrade|["']?websocket["']?)\s*;/i.test(target);
    var hasConnection = /proxy_set_header\s+Connection\s+(?:\$connection_upgrade|["']?upgrade["']?)\s*;/i.test(target);
    var timeoutRaw = lineForDirective(target, 'proxy_read_timeout');
    var timeoutOk = durationToSeconds(timeoutRaw) >= 60;
    var safeConnection = /\bmap\s+\$http_upgrade\s+\$connection_upgrade\b/i.test(config) && /proxy_set_header\s+Connection\s+\$connection_upgrade\s*;/i.test(target);
    var handshakeOk = hasProxyPass && hasHttp11 && hasUpgrade && hasConnection;
    var status = handshakeOk ? 101 : 400;
    var routeTrace = ['Browser -> Nginx /chat/', handshakeOk ? 'location /chat/ -> chat_backend' : 'location /chat/ -> handshake rejected'];
    var accessLog = ['127.0.0.1 - - "GET /chat/ HTTP/1.1" ' + status + ' 0 "-" "Lesson Simulator"'];
    var errorLog = [];
    var review = [];

    if (!hasHttp11) errorLog.push('upstream rejected the handshake because proxy_http_version 1.1 is missing');
    if (!hasUpgrade) errorLog.push('missing Upgrade header forwarding for websocket handshake');
    if (!hasConnection) errorLog.push('missing Connection upgrade header for handshake');
    if (!timeoutOk) errorLog.push('connection closes early because proxy_read_timeout is below 60 seconds');
    if (handshakeOk) review.push('The handshake path is now correct: Nginx forwards the upgrade request to chat_backend.');
    else review.push('A WebSocket handshake is not a normal HTTP proxy flow. You must forward the upgrade semantics explicitly.');
    if (timeoutOk) review.push('The connection lifetime is now long enough for a real-time stream to stay open.');
    else review.push('Even with a 101 response, the lesson stays incomplete until the connection survives beyond the timeout window.');
    if (!safeConnection) review.push('A fixed Connection "upgrade" header works here, but the stronger pattern is map $http_upgrade $connection_upgrade.');

    return buildResult(handshakeOk && timeoutOk ? (safeConnection ? 3 : 2) : 0,
      [
        { label: 'Handshake returns HTTP 101', required: true, passed: handshakeOk, detail: handshakeOk ? 'proxy_http_version, Upgrade, and Connection line up for the websocket handshake.' : 'The handshake still fails because one or more upgrade directives are missing.' },
        { label: 'Connection survives beyond 60 seconds', required: true, passed: timeoutOk, detail: timeoutOk ? 'proxy_read_timeout is high enough for the lesson traffic.' : 'Raise proxy_read_timeout so the connection does not die early.' },
        { label: 'Connection header pattern is safe for mixed traffic', required: false, passed: safeConnection || /proxy_set_header\s+Connection\s+["']?upgrade["']?\s*;/i.test(target), detail: safeConnection ? 'A map-based connection header is ready for mixed traffic.' : 'A fixed "upgrade" header works here, but the next iteration should move to a map-based variable.' }
      ],
      routeTrace,
      accessLog,
      errorLog,
      [
        { label: 'Handshake', value: handshakeOk ? '101 OK' : '400 Failed' },
        { label: 'Timeout', value: timeoutOk ? timeoutRaw : (timeoutRaw || 'Missing') },
        { label: 'Upgrade header', value: hasUpgrade ? 'Forwarded' : 'Missing' },
        { label: 'Connection safety', value: safeConnection ? 'Map-based' : 'Basic' }
      ],
      review
    );
  }

  function runLessonValidation(lesson, config) {
    if (lesson.id === 'mvp-01-welcome-page') return validateWelcomePage(config);
    if (lesson.id === 'mvp-02-domain-redirect') return validateDomainRedirect(config);
    if (lesson.id === 'mvp-03-location-match') return validateLocationMatch(config);
    if (lesson.id === 'mvp-04-first-reverse-proxy') return validateFirstReverseProxy(config);
    if (lesson.id === 'mvp-05-uri-rewrite') return validateUriRewrite(config);
    if (lesson.id === 'mvp-06-real-ip') return validateRealIp(config);
    if (lesson.id === 'mvp-07-basic-auth') return validateBasicAuth(config);
    if (lesson.id === 'mvp-08-websocket-upgrade') return validateWebSocket(config);
    if (lesson.id === 'mvp-09-buffering-tradeoffs') return validateBuffering(config);
    if (lesson.id === 'mvp-10-first-cache') return validateCache(config);
    return { completed: false, stars: 0, checks: [], routeTrace: ['Validation is not wired for this lesson yet.'], accessLog: ['No simulator yet.'], errorLog: ['No simulator yet.'], metrics: [], review: ['This lesson is scaffolded only in the current build.'] };
  }

  function startLesson(chapter, levelIdx) {
    var lesson = getLesson(chapter, levelIdx + 1);
    if (!lesson) {
      if (window.showToast) showToast('This lesson is not available in the learning prototype.', 'error');
      return;
    }
    currentLesson = lesson;
    currentResult = null;
    currentConfig = lesson.initialConfig || '';
    showScreen('game');
    renderLesson();
    if (window.AppInsight && AppInsight.trackEvent) {
      AppInsight.trackEvent('lesson_start', { lessonId: lesson.id, chapter: lesson.chapter, order: lesson.order, status: lesson.status });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
