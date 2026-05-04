/**
 * Execution Trace & History views — thinking process visualization.
 */

/* global esc, elapsed, navigateTo */

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY — Browse all past conversations
// ═══════════════════════════════════════════════════════════════════════════

var _transcriptCache = {};

function viewHistory(S) {
  var html = '<div class="page">';
  html += '<div class="section-header">📜 Conversation History</div>';
  html += '<p class="section-subtitle">Every session\'s thinking process, tool calls, knowledge lookups — the full cognitive trace</p>';

  html += '<div id="history-list">';
  html += '<div class="loading-state pixel" style="padding:40px">Loading transcripts…</div>';
  html += '</div></div>';

  setTimeout(loadHistoryList, 50);
  return html;
}

function loadHistoryList() {
  fetch('/api/transcripts')
    .then(function(r) { return r.json(); })
    .then(function(list) {
      var el = document.getElementById('history-list');
      if (!el) return;
      if (!list.length) { el.innerHTML = '<p class="text-muted" style="padding:32px;text-align:center">No transcripts found.</p>'; return; }

      var html = '<div class="grid grid--cards">';
      list.forEach(function(t) {
        var sizeKB = Math.round(t.size / 1024);
        var ago = t.mtime ? elapsed(new Date(t.mtime).toISOString()) : '';
        html += '<div class="tx-card" onclick="navigateTo(\'trace\',\'' + esc(t.id) + '\')">';
        html += '<div class="tx-card-top">';
        html += '<span class="tx-id mono">' + esc(t.id.slice(0, 8)) + '…</span>';
        html += '<span class="tx-time">' + esc(ago) + '</span>';
        if (t.hasSubagents) html += '<span class="capsule capsule--sm capsule--lavender">SUB-AGENTS</span>';
        html += '</div>';
        html += '<div class="tx-title">' + esc(t.title || '(untitled)') + '</div>';
        html += '<div class="tx-meta">' + sizeKB + 'KB</div>';
        html += '</div>';
      });
      html += '</div>';
      el.innerHTML = html;
    })
    .catch(function() {
      var el = document.getElementById('history-list');
      if (el) el.innerHTML = '<p class="text-muted">Failed to load transcripts.</p>';
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACE — Single session execution flow visualization
// ═══════════════════════════════════════════════════════════════════════════

function viewTrace(S, txId) {
  if (!txId) return viewHistory(S);

  var html = '<div class="page">';
  html += '<a href="#/history" class="back-link">← History</a>';
  html += '<div class="section-header" style="font-size:28px">🧠 Execution Trace</div>';
  html += '<p class="mono text-muted" style="margin-bottom:16px">' + esc(txId) + '</p>';
  html += '<div id="trace-container">';
  html += '<div class="loading-state pixel" style="padding:40px">Parsing cognitive trace…</div>';
  html += '</div></div>';

  setTimeout(function() { loadTrace(txId); }, 50);
  return html;
}

function loadTrace(txId) {
  if (_transcriptCache[txId]) { renderTrace(_transcriptCache[txId]); return; }

  fetch('/api/transcripts/' + txId)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _transcriptCache[txId] = data;
      renderTrace(data);
    })
    .catch(function() {
      var el = document.getElementById('trace-container');
      if (el) el.innerHTML = '<p class="text-muted">Failed to load trace.</p>';
    });
}

function renderTrace(data) {
  var el = document.getElementById('trace-container');
  if (!el) return;

  var events = data.events || [];
  var subagents = data.subagents || [];

  // Stats bar
  var thinkCount = 0, toolCount = 0, ruleCount = 0, skillCount = 0, gateCount = 0, userCount = 0;
  events.forEach(function(e) {
    if (e.type === 'thinking') thinkCount++;
    if (e.type === 'tool') toolCount++;
    if (e.type === 'rule_adopt') ruleCount++;
    if (e.type === 'skill_invoke') skillCount++;
    if (e.type === 'decision_gate') gateCount++;
    if (e.type === 'user_input') userCount++;
  });

  var html = '';

  // Stats
  html += '<div class="stat-row" style="margin-bottom:24px">';
  html += '<div class="stat-block"><div class="stat-value">' + events.length + '</div><div class="stat-label">Events</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid #9E9E9E"><div class="stat-value">' + thinkCount + '</div><div class="stat-label">Thoughts</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--mint-dark,#26A69A)"><div class="stat-value">' + toolCount + '</div><div class="stat-label">Tools</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--lavender-dark,#7E57C2)"><div class="stat-value">' + ruleCount + '</div><div class="stat-label">Rules</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--green)"><div class="stat-value">' + skillCount + '</div><div class="stat-label">Skills</div></div>';
  if (gateCount) html += '<div class="stat-block" style="border-left:4px solid var(--yellow-dark)"><div class="stat-value">' + gateCount + '</div><div class="stat-label">Decisions</div></div>';
  html += '</div>';

  // Execution timeline
  html += '<div class="trace-timeline">';

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    html += renderTraceEvent(ev, i);
  }

  html += '</div>';

  // Subagent traces
  if (subagents.length > 0) {
    html += '<div class="page-section" style="margin-top:32px">';
    html += '<div class="section-header">🤖 Sub-agent Traces</div>';
    subagents.forEach(function(sa) {
      html += '<div class="sa-trace-block">';
      html += '<div class="sa-trace-header">' + esc(sa.id.slice(0, 8)) + '… <span class="capsule capsule--sm capsule--green">' + sa.events.length + ' events</span></div>';
      html += '<div class="trace-timeline trace-timeline--sub">';
      sa.events.forEach(function(ev, idx) { html += renderTraceEvent(ev, idx); });
      html += '</div></div>';
    });
    html += '</div>';
  }

  el.innerHTML = html;
}

function renderTraceEvent(ev, idx) {
  var html = '';
  var delay = Math.min(idx * 20, 600);

  switch (ev.type) {
    case 'user_input':
      html += '<div class="te te--user anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">👤</div>';
      html += '<div class="te-body te-body--user">';
      html += '<div class="te-label">USER INPUT</div>';
      html += '<div class="te-text">' + esc(ev.text) + '</div>';
      html += '</div></div>';
      break;

    case 'thinking':
      html += '<div class="te te--think anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">🧠</div>';
      html += '<div class="te-body te-body--think">';
      html += '<div class="te-label">REASONING</div>';
      html += '<pre class="te-code">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
      break;

    case 'tool':
      html += '<div class="te te--tool anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">🛠️</div>';
      html += '<div class="te-body te-body--tool">';
      html += '<div class="te-label">TOOL · <strong>' + esc(ev.name) + '</strong></div>';
      if (ev.input) html += '<div class="te-meta mono">' + esc(ev.input) + '</div>';
      html += '</div></div>';
      break;

    case 'tool_result':
      html += '<div class="te te--tool-result anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">📄</div>';
      html += '<div class="te-body te-body--tool-result">';
      html += '<div class="te-label">RESULT' + (ev.name ? ' · ' + esc(ev.name) : '') + '</div>';
      if (ev.content) html += '<pre class="te-code te-code--sm">' + esc(ev.content) + '</pre>';
      html += '</div></div>';
      break;

    case 'rule_adopt':
      html += '<div class="te te--rule anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">📏</div>';
      html += '<div class="te-body te-body--rule">';
      html += '<span class="te-label">RULE</span> <strong>' + esc(ev.name) + '</strong>';
      html += '</div></div>';
      break;

    case 'skill_invoke':
      html += '<div class="te te--skill anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">🎓</div>';
      html += '<div class="te-body te-body--skill">';
      html += '<span class="te-label">SKILL</span> <strong>' + esc(ev.name) + '</strong>';
      html += '</div></div>';
      break;

    case 'decision_gate':
      html += '<div class="te te--gate anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">⚖️</div>';
      html += '<div class="te-body te-body--gate' + (ev.veto ? ' te-body--veto' : '') + '">';
      html += '<div class="te-label">DECISION GATE' + (ev.veto ? ' <span class="te-veto-stamp">[ VETO ]</span>' : '') + '</div>';
      html += '<pre class="te-code">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
      break;

    case 'validation':
      html += '<div class="te te--validate anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">✅</div>';
      html += '<div class="te-body te-body--validate">';
      html += '<div class="te-label">VALIDATION GATE</div>';
      html += '<pre class="te-code">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
      break;

    case 'wrapup':
      html += '<div class="te te--wrapup anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">📦</div>';
      html += '<div class="te-body te-body--wrapup">';
      html += '<div class="te-label">WRAP-UP</div>';
      html += '<pre class="te-code">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
      break;

    case 'subagent':
      html += '<div class="te te--subagent anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">🤖</div>';
      html += '<div class="te-body te-body--subagent">';
      html += '<div class="te-label">SUB-AGENT</div>';
      html += '<pre class="te-code">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
      break;

    default:
      html += '<div class="te anim-enter" style="animation-delay:' + delay + 'ms">';
      html += '<div class="te-icon">·</div>';
      html += '<div class="te-body"><div class="te-label">' + esc(ev.type).toUpperCase() + '</div>';
      if (ev.text) html += '<pre class="te-code te-code--sm">' + esc(ev.text) + '</pre>';
      html += '</div></div>';
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION TRACE (live, from heartbeat)
// ═══════════════════════════════════════════════════════════════════════════

function viewSessionTrace(S, sessionId) {
  var session = (S.sessions || []).find(function(s) {
    return (s.sessionId || s._file) === sessionId || s._transcriptId === sessionId;
  });

  if (!session && sessionId) {
    return viewTrace(S, sessionId);
  }

  if (!session) {
    return '<div class="page"><a href="#/" class="back-link">← Overview</a>' +
      '<div class="section-header">Session not found</div>' +
      '<p class="text-muted">Session ' + esc(sessionId) + ' is no longer active or has been cleaned up.</p></div>';
  }

  if (session._source === 'inferred' && session._transcriptId) {
    return viewTrace(S, session._transcriptId);
  }

  var html = '<div class="page">';
  html += '<a href="#/" class="back-link">← Overview</a>';

  var phaseLabel = { idle: 'IDLE', started: 'BOOT', 'decision-gate': 'DECISION GATE', executing: 'EXECUTING', validating: 'VALIDATING', 'wrapping-up': 'WRAPPING UP', unknown: 'ACTIVE' };
  html += '<div class="session-live-header">';
  html += '<span class="status-dot status-dot--active" style="width:12px;height:12px"></span>';
  html += '<span class="section-header" style="margin-bottom:0;font-size:28px">Session ' + esc(session.sessionId || session._file) + '</span>';
  html += '<span class="capsule capsule--green">' + (phaseLabel[session.phase] || session.phase.toUpperCase()) + '</span>';
  if (session._stale) html += '<span class="capsule capsule--warning">STALE</span>';
  if (session._source) html += '<span class="capsule capsule--sm capsule--lavender">' + session._source.toUpperCase() + '</span>';
  html += '</div>';
  html += '<p style="margin:8px 0 4px;font-weight:600">"' + esc(session.demand || '') + '"</p>';
  html += '<p class="text-muted text-sm">Started ' + elapsed(session.startedAt) + ' · Last update ' + elapsed(session.updatedAt) + '</p>';

  if (typeof renderLifecycleTrack === 'function') {
    html += '<div style="margin:20px 0">' + renderLifecycleTrack(session) + '</div>';
  }

  var subs = session.subagents || [];
  if (subs.length > 0) {
    html += '<div class="page-section" style="margin-top:16px">';
    html += '<div class="section-header" style="font-size:20px">🤖 Active Sub-agents</div>';
    subs.forEach(function(sa) {
      var dotColor = sa.status === 'running' ? 'var(--green)' : sa.status === 'failed' ? 'var(--red)' : '#9E9E9E';
      html += '<div class="sa-card">';
      html += '<div class="sa-header">';
      html += '<span class="status-dot" style="background:' + dotColor + '"></span>';
      html += '<span class="sa-name">' + esc(sa.type) + '</span>';
      html += '<span class="sa-badge sa-badge--' + sa.status + '">' + sa.status.toUpperCase() + '</span>';
      html += '</div>';
      if (sa.startedAt) html += '<div class="sa-meta">▸ Started ' + elapsed(sa.startedAt) + '</div>';
      if (sa.result) html += '<div class="sa-result">' + esc(sa.result) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (session._transcriptId) {
    html += '<div style="margin-top:16px"><a href="#/trace/' + esc(session._transcriptId) + '" style="font-size:12px;font-weight:600;color:var(--green)">View Execution Trace →</a></div>';
  }

  html += '</div>';
  return html;
}
