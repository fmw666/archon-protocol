/**
 * Shared UI components — pure render functions returning HTML strings.
 */

/* global esc, elapsed */

// ── Constants ──

var LIFECYCLE_STEPS = [
  { id: 'boot', icon: '⚡', label: 'Boot', phaseKey: 'started', desc: 'Load soul.md + manifest.md — acquire project context and identity' },
  { id: 'scan', icon: '🔍', label: 'Pre-scan', desc: 'Check conversation memos & ADRs for prior decisions on this topic' },
  { id: 'decision-gate', icon: '⚖️', label: 'Decision Gate', desc: 'Evaluate: should this be done? Convergence scope check (ADR-12) → Verdict (ADR-11 Plan-mode bound) → may veto or flag out-of-scope.' },
  { id: 'executing', icon: '🔨', label: 'Execute', desc: 'Write code guided by skills, rules, and systematic debugging' },
  { id: 'validating', icon: '✅', label: 'Validate', desc: 'Run lint + typecheck + test — must be green to proceed' },
  { id: 'wrapping-up', icon: '📦', label: 'Wrap-up', desc: 'Update manifest → audit → score drift → gate milestone → memo → git' },
];

var PHASE_LABELS = {
  idle: 'IDLE', started: 'BOOT', 'decision-gate': 'DECISION GATE',
  executing: 'EXECUTING', validating: 'VALIDATING', 'wrapping-up': 'WRAPPING UP',
  unknown: 'ACTIVE',
};

// ── Lifecycle Track ──

function renderLifecycleTrack(session) {
  var phaseKey = session.phase === 'started' ? 'boot' : session.phase;
  var currentIdx = LIFECYCLE_STEPS.findIndex(function(s) { return s.id === phaseKey || s.phaseKey === session.phase; });
  if (currentIdx === -1) currentIdx = 0;

  var html = '<div class="lc-track">';
  for (var i = 0; i < LIFECYCLE_STEPS.length; i++) {
    var step = LIFECYCLE_STEPS[i];
    var dotCls = 'lc-dot';
    var lblCls = 'lc-label';
    if (i < currentIdx) dotCls += ' lc-dot--done';
    else if (i === currentIdx) { dotCls += ' lc-dot--current'; lblCls += ' lc-label--current'; }
    else dotCls += ' lc-dot--future';
    html += '<div class="lc-step"><div class="' + dotCls + '">' + step.icon + '</div><span class="' + lblCls + '">' + step.label + '</span></div>';
    if (i < LIFECYCLE_STEPS.length - 1) {
      html += '<div class="lc-line' + (i < currentIdx ? ' lc-line--done' : '') + '"></div>';
    }
  }
  html += '</div>';
  return html;
}

// ── Gauge ──

function renderGauge(current, max) {
  var pct = Math.min(100, Math.round((current / max) * 100));
  var color = current >= max ? '#EF5350' : current >= max * 0.67 ? '#FFB300' : '#66BB6A';
  var remaining = max - current;
  return '<div class="gauge">' +
    '<span class="gauge-label">' + current + '/' + max + '</span>' +
    '<div class="gauge-bar"><div class="gauge-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '<span class="gauge-hint">' + (remaining > 0 ? remaining + ' to review' : 'REVIEW DUE') + '</span>' +
    '</div>';
}

// ── Capsules ──

function renderDebtBadges(debt) {
  var items = debt ? debt.items : [];
  var cr = items.filter(function(i) { return i.severity === 'Critical'; }).length;
  var wa = items.filter(function(i) { return i.severity === 'Warning'; }).length;
  var inf = items.filter(function(i) { return i.severity === 'Info'; }).length;
  var html = '';
  if (cr) html += '<span class="capsule capsule--critical">' + cr + ' Critical</span> ';
  if (wa) html += '<span class="capsule capsule--warning">' + wa + ' Warning</span> ';
  if (inf) html += '<span class="capsule capsule--info">' + inf + ' Info</span> ';
  if (!cr && !wa && !inf) html = '<span class="capsule capsule--green">0 Debt</span>';
  return html;
}

function renderMilestoneBadge(manifest) {
  if (!manifest || !manifest.milestones.length) return '';
  var cur = manifest.milestones.find(function(ms) { return ms.status === '🔧'; }) || manifest.milestones[manifest.milestones.length - 1];
  if (!cur) return '';
  var pct = Math.round((cur.checks.done / Math.max(1, cur.checks.total)) * 100);
  return '<span class="capsule capsule--sky">' + esc(cur.id) + ' ' + pct + '%</span>';
}

// ── Session Status (topbar) ──

function renderSessionStatus(sessions) {
  var active = (sessions || []).filter(function(s) { return s.phase !== 'idle'; });
  if (active.length > 0) {
    var html = '<span class="status-dot status-dot--active"></span>';
    html += '<span style="font-family:var(--font-pixel);font-size:18px;text-transform:uppercase;letter-spacing:1px">' + active.length + ' ACTIVE</span> ';
    active.forEach(function(s) {
      html += '<span class="capsule capsule--sm capsule--green">' + (PHASE_LABELS[s.phase] || s.phase.toUpperCase()) + '</span> ';
    });
    return html;
  }
  return '<span class="status-dot status-dot--idle"></span><span style="font-family:var(--font-pixel);font-size:18px;text-transform:uppercase;letter-spacing:1px;color:#888">IDLE</span>';
}

// ── Session Card (overview) ──

function renderSessionCard(session) {
  var phaseKey = session.phase === 'started' ? 'boot' : session.phase;
  var currentStep = LIFECYCLE_STEPS.find(function(s) { return s.id === phaseKey || s.phaseKey === session.phase; }) || LIFECYCLE_STEPS[0];
  var cardCls = 'session-card' + (session._stale ? ' session-card--stale' : ' session-card--active');

  var isInferred = session._source === 'inferred' || session._source === 'merged';
  var clickTarget = isInferred && session._transcriptId
    ? "navigateTo('trace','" + esc(session._transcriptId) + "')"
    : "navigateTo('session','" + esc(session.sessionId || session._file || '') + "')";

  var html = '<div class="' + cardCls + '" onclick="' + clickTarget + '">';
  html += '<div class="session-top">';
  html += '<span class="session-id">' + esc(session.sessionId || session._file || '?') + '</span>';

  var srcLabel = session._source === 'inferred' ? '[I]' : session._source === 'merged' ? '[M]' : session._source === 'heartbeat' ? '[H]' : '';
  if (srcLabel) html += '<span class="session-src" title="Source: ' + esc(session._source) + '">' + srcLabel + '</span>';

  html += '<span class="session-phase">' + currentStep.icon + ' ' + (PHASE_LABELS[session.phase] || session.phase.toUpperCase()) + '</span>';
  html += '<span class="session-time">' + elapsed(session.startedAt) + '</span>';
  html += '<span class="session-demand">' + esc(session.demand || '') + '</span>';
  html += '</div>';
  html += '<div class="session-body">';
  html += renderLifecycleTrack(session);
  var subs = session.subagents || [];
  if (subs.length > 0) {
    html += '<div class="session-subs">';
    subs.forEach(function(sa) {
      html += '<span class="status-dot" style="background:' + (sa.status === 'running' ? 'var(--green)' : sa.status === 'failed' ? 'var(--red)' : '#9E9E9E') + ';width:8px;height:8px;margin-right:4px"></span>';
      html += '<strong>' + esc(sa.type) + '</strong>: ' + sa.status.toUpperCase();
      if (sa.result) html += ' — ' + esc(sa.result);
      html += '<br>';
    });
    html += '</div>';
  }
  if (session._stale) html += '<div style="margin-top:8px;font-size:11px;color:var(--orange);font-weight:700">⚠ STALE — no heartbeat for 30+ min</div>';
  if (session._lastTool) html += '<div style="margin-top:4px;font-size:11px;color:#888">' + esc(session._eventCount || 0) + ' events · last: ' + esc(session._lastTool) + '</div>';
  html += '</div></div>';
  return html;
}

// ── Milestones ──

function renderMilestones(milestones) {
  if (!milestones || !milestones.length) return '<p class="text-muted">No milestones defined.</p>';
  return milestones.map(function(ms) {
    var pct = Math.round((ms.checks.done / Math.max(1, ms.checks.total)) * 100);
    return '<div class="milestone"><div class="milestone-header">' +
      '<span class="milestone-id">' + esc(ms.status) + ' ' + esc(ms.id) + '</span>' +
      '<div class="milestone-bar"><div class="milestone-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="milestone-pct">' + pct + '%</span></div>' +
      '<div class="milestone-name">' + esc(ms.name) + ' (' + ms.checks.done + '/' + ms.checks.total + ')</div></div>';
  }).join('');
}

// ── Memos ──

function renderMemoCards(memos) {
  if (!memos || !memos.length) return '<p class="text-muted">No conversation memos.</p>';
  return memos.slice().reverse().map(function(m) {
    return '<div class="memo-card"><div class="memo-date">' + esc(m['Date'] || '') + '</div>' +
      '<div class="memo-topic">' + esc(m['Topic'] || '') + '</div>' +
      '<div class="memo-conclusion">' + esc(m['Conclusion'] || '') + ' — <span class="text-muted">' + esc(m['Rationale'] || '') + '</span></div></div>';
  }).join('');
}

// ── Knowledge Assets ──

function renderKAGrid(title, items, variant) {
  if (!items || !items.length) return '';
  var keys = Object.keys(items[0]);
  return '<div class="page-section"><div class="section-header">' + esc(title) + ' <span class="capsule capsule--sm capsule--' + variant + '">' + items.length + '</span></div>' +
    '<div class="grid grid--3">' +
    items.map(function(it) {
      return '<div class="ka-card"><div class="ka-name">' + esc(it[keys[0]] || '').replace(/`/g, '') + '</div><div class="ka-desc">' + esc(it[keys[1]] || '') + '</div></div>';
    }).join('') +
    '</div></div>';
}

// ── ADR Items ──

function renderGlossary(glossary) {
  if (!glossary || !glossary.length) return '<p class="text-muted">No glossary terms defined.</p>';
  var html = '<div class="table-wrap"><table class="detail-table">';
  html += '<tr><th>Term</th><th>Project Meaning</th><th>≠ Common Meaning</th></tr>';
  glossary.forEach(function(g) {
    html += '<tr>';
    html += '<td><strong>' + esc(g['Term'] || '') + '</strong></td>';
    html += '<td>' + esc(g['Meaning in This Project'] || '') + '</td>';
    html += '<td class="text-muted">' + esc(g['≠ Common Meaning'] || '') + '</td>';
    html += '</tr>';
  });
  html += '</table></div>';
  return html;
}

function renderADRList(active, rejected) {
  if (!(active || []).length && !(rejected || []).length) return '<p class="text-muted">No architecture decisions.</p>';
  function renderItem(d, variant) {
    return '<div class="adr-item ' + variant + '">' +
      '<span class="adr-id">' + esc(d.id) + '</span> <span class="adr-title">' + esc(d.title) + '</span>' +
      '<div class="adr-meta">' + esc(d.date) + ' · ' + esc(d.status) + (d.reason ? ' · ' + esc(d.reason) : '') + '</div></div>';
  }
  return (active || []).map(function(d) { return renderItem(d, 'adr-item--active'); }).join('') +
    (rejected || []).map(function(d) { return renderItem(d, 'adr-item--rejected'); }).join('');
}

// ── Subagent Panel ──

function renderSubagentPanel(hooks, sessions) {
  var allSubs = [];
  (sessions || []).forEach(function(sess) {
    (sess.subagents || []).forEach(function(sa) {
      var merged = {};
      for (var k in sa) merged[k] = sa[k];
      merged._session = sess.sessionId || sess._file || '?';
      allSubs.push(merged);
    });
  });

  if (!hooks || !hooks.length) return '<p class="text-muted">No subagent hooks declared.</p>';

  return hooks.map(function(hook) {
    var rawName = hook['Agent'] || Object.values(hook)[0] || '';
    var cleanName = rawName.replace(/`/g, '').replace(/\.md$/, '');
    var trigger = hook['Trigger'] || Object.values(hook)[1] || '';
    var duty = hook['Responsibility'] || Object.values(hook)[2] || '';
    var live = allSubs.find(function(s) { return cleanName.includes(s.type); });
    var status = live ? live.status : 'idle';

    var html = '<div class="sa-card">';
    html += '<div class="sa-header">';
    html += '<span class="status-dot" style="background:' + (status === 'running' ? 'var(--green)' : status === 'failed' ? 'var(--red)' : '#9E9E9E') + '"></span>';
    html += '<span class="sa-name">' + esc(cleanName) + '</span>';
    html += '<span class="sa-badge sa-badge--' + status + '">' + status.toUpperCase() + '</span>';
    if (live && live._session) html += '<span class="text-muted text-sm" style="margin-left:4px">(' + esc(live._session) + ')</span>';
    html += '</div>';
    html += '<div class="sa-meta">⏱ ' + esc(trigger) + '</div>';
    html += '<div class="sa-meta">📋 ' + esc(duty) + '</div>';
    if (live && live.startedAt) html += '<div class="sa-meta" style="color:#2E7D32">▸ Started ' + elapsed(live.startedAt) + '</div>';
    if (live && live.result) html += '<div class="sa-result">' + esc(live.result) + '</div>';
    html += '</div>';
    return html;
  }).join('');
}
