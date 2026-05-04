/**
 * Page view renderers — each returns full HTML for a page.
 */

/* global esc, elapsed, patchEl, LIFECYCLE_STEPS, PHASE_LABELS,
   renderLifecycleTrack, renderGauge, renderDebtBadges, renderMilestoneBadge,
   renderSessionStatus, renderSessionCard, renderMilestones, renderMemoCards,
   renderKAGrid, renderADRList, renderSubagentPanel, renderGlossary */

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function viewOverview(S) {
  var sessions = (S.sessions || []).filter(function(s) { return s.phase !== 'idle'; });
  var d = S.drift || { current: 0, threshold: 12, logs: [], reviews: [] };
  var m = S.manifest || { milestones: [], knowledgeAssets: { rules: [], skills: [], hooks: [], decisions: [] }, memos: [] };
  var debt = S.debt || { items: [] };

  var html = '<div class="page">';

  // Active sessions
  if (sessions.length > 0) {
    html += '<div class="page-section">';
    html += '<div class="section-header">🧠 Active Sessions</div>';
    html += '<div class="grid grid--cards">';
    sessions.forEach(function(s) { html += renderSessionCard(s); });
    html += '</div></div>';
  }

  // Stats row
  var pendingDebt = debt.items.filter(function(i) { return i.status === 'pending' || i.status === 'partial'; }).length;
  var totalDeliveries = d.logs.length;
  var captureCount = d.logs.filter(function(l) { return l.capture && l.capture !== '—' && l.capture !== ''; }).length;
  var captureRate = totalDeliveries > 0 ? Math.round((captureCount / totalDeliveries) * 100) : 0;

  html += '<div class="page-section"><div class="stat-row">';
  html += '<div class="stat-block"><div class="stat-value">' + d.current + '/' + d.threshold + '</div><div class="stat-label">Drift</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + pendingDebt + '</div><div class="stat-label">Active Debt</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + totalDeliveries + '</div><div class="stat-label">Deliveries</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + captureRate + '%</div><div class="stat-label">Capture Rate</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + d.reviews.length + '</div><div class="stat-label">Reviews</div></div>';
  html += '</div></div>';

  // Recent deliveries mini-timeline
  var recent = d.logs.slice(-20);
  if (recent.length > 0) {
    html += '<div class="page-section">';
    html += '<div class="section-header">📊 Recent Deliveries</div>';
    html += '<div class="timeline-container"><div class="timeline">';
    for (var i = 0; i < recent.length; i++) {
      var log = recent[i];
      var hasCapture = log.capture && log.capture !== '—' && log.capture !== '';
      var score = parseInt(log.score) || 0;
      var dotCls = 'tl-dot' + (hasCapture ? ' tl-dot--capture' : '') + (score >= 3 ? ' tl-dot--high' : '');
      html += '<div class="tl-entry">';
      html += '<div class="tl-tooltip">' + esc((log.summary || '').slice(0, 60)) + '</div>';
      html += '<div class="' + dotCls + '"></div>';
      html += '<div class="tl-score">' + esc(log.score || '') + '</div>';
      html += '<div class="tl-date">' + esc(log.date || '') + '</div>';
      html += '</div>';
      if (i < recent.length - 1) html += '<div class="tl-line"></div>';
    }
    html += '</div></div></div>';
  }

  // Three-column grid: Milestones + Debt + Knowledge
  html += '<div class="grid grid--3">';

  html += '<div class="card card--yellow"><div class="card-header">📋 Milestones</div>';
  html += '<div class="card-body card-body--scroll">' + renderMilestones(m.milestones) + '</div></div>';

  html += '<div class="card card--pink"><div class="card-header">🔴 Debt</div>';
  html += '<div class="card-body card-body--scroll">';
  if (debt.items.length === 0) html += '<p class="text-muted">No debt entries.</p>';
  else {
    debt.items.slice(0, 6).forEach(function(it) {
      html += '<div style="margin-bottom:8px;padding:4px 0;border-bottom:1px solid var(--divider)">';
      html += '<strong class="severity-' + it.severity.toLowerCase() + '">' + esc(it.id) + '</strong> ';
      html += '<span class="text-sm">' + esc(it.description.slice(0, 60)) + (it.description.length > 60 ? '…' : '') + '</span>';
      html += '<div class="text-sm text-muted">' + esc(it.deadline) + ' · ' + esc(it.status) + '</div></div>';
    });
    if (debt.items.length > 6) html += '<a href="#/debt" style="font-size:12px;font-weight:600;color:var(--green)">View all ' + debt.items.length + ' →</a>';
  }
  html += '</div></div>';

  var ka = m.knowledgeAssets;
  var dec = S.decisions || { active: [], rejected: [] };
  var adrCount = dec.active.length + dec.rejected.length;
  html += '<div class="card card--lavender"><div class="card-header">🧠 Knowledge</div>';
  html += '<div class="card-body card-body--scroll">';
  html += '<div style="margin-bottom:8px"><strong>' + ka.rules.length + '</strong> Rules · <strong>' + ka.skills.length + '</strong> Skills · <strong>' + ka.hooks.length + '</strong> Hooks · <strong>' + adrCount + '</strong> ADRs';
  if (m.glossary && m.glossary.length > 0) html += ' · <strong>' + m.glossary.length + '</strong> Terms';
  html += '</div>';
  html += '<div class="text-sm text-muted">Capture rate: ' + captureRate + '% (' + captureCount + '/' + totalDeliveries + ')</div>';
  html += '<a href="#/knowledge" style="font-size:12px;font-weight:600;color:var(--green);display:block;margin-top:8px">Explore →</a>';
  html += '</div></div>';

  html += '</div>';

  // Latest memos
  if (m.memos.length > 0) {
    html += '<div class="page-section" style="margin-top:24px">';
    html += '<div class="section-header">💬 Latest Memos</div>';
    var recentMemos = m.memos.slice(-3).reverse();
    recentMemos.forEach(function(memo) {
      html += '<div class="memo-card"><div class="memo-date">' + esc(memo['Date'] || '') + '</div>';
      html += '<div class="memo-topic">' + esc(memo['Topic'] || '') + '</div>';
      html += '<div class="memo-conclusion">' + esc(memo['Conclusion'] || '') + '</div></div>';
    });
    if (m.memos.length > 3) html += '<a href="#/memory" style="font-size:12px;font-weight:600;color:var(--green)">View all ' + m.memos.length + ' →</a>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION DETAIL (kept for compatibility, delegates to viewSessionTrace)
// ═══════════════════════════════════════════════════════════════════════════

function viewSession(S, sessionId) {
  if (typeof viewSessionTrace === 'function') return viewSessionTrace(S, sessionId);
  return '<div class="page"><p class="text-muted">Session view unavailable.</p></div>';
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

function viewTimeline(S) {
  var d = S.drift || { current: 0, threshold: 12, logs: [], reviews: [] };

  var html = '<div class="page">';
  html += '<div class="section-header">📊 Delivery Timeline</div>';
  html += '<p class="section-subtitle">Every delivery scored, every review cycle bounded, every knowledge capture marked</p>';

  // Stats
  var totalDeliveries = d.logs.length;
  var captureCount = d.logs.filter(function(l) { return l.capture && l.capture !== '—' && l.capture !== ''; }).length;
  var totalScore = d.logs.reduce(function(sum, l) { return sum + (parseInt(l.score) || 0); }, 0);

  html += '<div class="stat-row">';
  html += '<div class="stat-block"><div class="stat-value">' + totalDeliveries + '</div><div class="stat-label">Total Deliveries</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + d.reviews.length + '</div><div class="stat-label">Review Cycles</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + captureCount + '</div><div class="stat-label">Captures</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + totalScore + '</div><div class="stat-label">Total Score</div></div>';
  html += '</div>';

  // Full timeline
  if (d.logs.length > 0) {
    html += '<div class="timeline-container"><div class="timeline">';
    for (var i = 0; i < d.logs.length; i++) {
      var log = d.logs[i];
      var hasCapture = log.capture && log.capture !== '—' && log.capture !== '';
      var score = parseInt(log.score) || 0;
      var dotCls = 'tl-dot' + (hasCapture ? ' tl-dot--capture' : '') + (score >= 5 ? ' tl-dot--high' : '');
      html += '<div class="tl-entry">';
      html += '<div class="tl-tooltip">' + esc((log.summary || '').slice(0, 80)) + (hasCapture ? ' [' + esc(log.capture) + ']' : '') + '</div>';
      html += '<div class="' + dotCls + '"></div>';
      html += '<div class="tl-score">' + esc(log.score || '') + '</div>';
      html += '<div class="tl-date">' + esc(log.date || '') + '</div>';
      html += '</div>';
      if (i < d.logs.length - 1) html += '<div class="tl-line"></div>';
    }
    html += '</div></div>';
  }

  // Delivery log table
  html += '<div class="page-section" style="margin-top:24px">';
  html += '<div class="section-header" style="font-size:18px">Delivery Log</div>';
  html += '<div class="table-wrap"><table class="detail-table">';
  html += '<tr><th>Date</th><th>Summary</th><th>+Score</th><th>Capture</th><th>Total</th></tr>';

  var allEntries = [];
  d.logs.forEach(function(l) { allEntries.push({ type: 'log', data: l }); });
  d.reviews.forEach(function(r) { allEntries.push({ type: 'review', data: r }); });

  d.logs.forEach(function(log) {
    var hasCapture = log.capture && log.capture !== '—' && log.capture !== '';
    html += '<tr>';
    html += '<td style="white-space:nowrap">' + esc(log.date) + '</td>';
    html += '<td>' + esc((log.summary || '').slice(0, 80)) + (log.summary && log.summary.length > 80 ? '…' : '') + '</td>';
    html += '<td><strong>' + esc(log.score || '') + '</strong></td>';
    html += '<td' + (hasCapture ? ' style="color:var(--green);font-weight:600"' : '') + '>' + esc(log.capture || '—') + '</td>';
    html += '<td>' + esc(log.total || '') + '</td>';
    html += '</tr>';
  });

  d.reviews.forEach(function(r) {
    html += '<tr class="review-row"><td colspan="5" style="font-size:11px">' + esc((r.summary || '').slice(0, 120)) + '</td></tr>';
  });

  html += '</table></div></div>';
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE
// ═══════════════════════════════════════════════════════════════════════════

function viewKnowledge(S) {
  var m = S.manifest || { knowledgeAssets: { rules: [], skills: [], hooks: [], decisions: [] } };
  var dec = S.decisions || { active: [], rejected: [] };
  var ka = m.knowledgeAssets;

  var html = '<div class="page">';
  html += '<div class="section-header">🧠 Knowledge Map</div>';
  html += '<p class="section-subtitle">Rules enforce, skills guide, hooks automate, decisions record</p>';

  // Stats
  html += '<div class="stat-row">';
  html += '<div class="stat-block" style="border-left:4px solid var(--lavender)"><div class="stat-value">' + ka.rules.length + '</div><div class="stat-label">Rules</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--mint)"><div class="stat-value">' + ka.skills.length + '</div><div class="stat-label">Skills</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--sky)"><div class="stat-value">' + ka.hooks.length + '</div><div class="stat-label">Hooks</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--green)"><div class="stat-value">' + (dec.active.length + dec.rejected.length) + '</div><div class="stat-label">ADRs</div></div>';
  html += '</div>';

  html += renderKAGrid('📏 Rules', ka.rules, 'lavender');
  html += renderKAGrid('🎓 Skills', ka.skills, 'info');
  html += renderKAGrid('🔗 Lifecycle Hooks', ka.hooks, 'sky');

  // ADRs
  html += '<div class="page-section">';
  html += '<div class="section-header">📐 Architecture Decisions</div>';
  if (dec.active.length > 0) {
    html += '<div class="section-subtitle">Active (' + dec.active.length + ')</div>';
    html += renderADRList(dec.active, []);
  }
  if (dec.rejected.length > 0) {
    html += '<div class="section-subtitle" style="margin-top:16px">Rejected (' + dec.rejected.length + ')</div>';
    html += renderADRList([], dec.rejected);
  }
  html += '</div>';

  // Subagent workforce
  html += '<div class="page-section">';
  html += '<div class="section-header">🤖 Subagent Workforce</div>';
  html += renderSubagentPanel(ka.hooks, S.sessions);
  html += '</div>';

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBT
// ═══════════════════════════════════════════════════════════════════════════

function viewDebt(S) {
  var debt = S.debt || { items: [] };

  var html = '<div class="page">';
  html += '<div class="section-header">🔴 Debt Tracker</div>';
  html += '<p class="section-subtitle">Deferred is fine. Forgotten is not. Every debt has an owner and a deadline.</p>';

  var pending = debt.items.filter(function(i) { return i.status === 'pending' || i.status === 'partial'; });
  var resolved = debt.items.filter(function(i) { return i.status === 'resolved'; });
  var cr = debt.items.filter(function(i) { return i.severity === 'Critical'; }).length;
  var wa = debt.items.filter(function(i) { return i.severity === 'Warning'; }).length;
  var inf = debt.items.filter(function(i) { return i.severity === 'Info'; }).length;

  html += '<div class="stat-row">';
  html += '<div class="stat-block"><div class="stat-value">' + debt.items.length + '</div><div class="stat-label">Total</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid #C62828"><div class="stat-value">' + cr + '</div><div class="stat-label">Critical</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid #F57F17"><div class="stat-value">' + wa + '</div><div class="stat-label">Warning</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid #00695C"><div class="stat-value">' + inf + '</div><div class="stat-label">Info</div></div>';
  html += '<div class="stat-block"><div class="stat-value">' + pending.length + '</div><div class="stat-label">Pending</div></div>';
  html += '<div class="stat-block" style="border-left:4px solid var(--green)"><div class="stat-value">' + resolved.length + '</div><div class="stat-label">Resolved</div></div>';
  html += '</div>';

  if (debt.items.length === 0) {
    html += '<p class="text-muted" style="padding:32px 0;text-align:center">No debt entries. Clean slate.</p>';
  } else {
    html += '<div class="table-wrap"><table class="detail-table">';
    html += '<tr><th>ID</th><th>Source</th><th>Severity</th><th>Description</th><th>Deadline</th><th>Status</th></tr>';
    debt.items.forEach(function(it) {
      html += '<tr>';
      html += '<td><strong>' + esc(it.id) + '</strong></td>';
      html += '<td class="text-sm">' + esc(it.source) + '</td>';
      html += '<td class="severity-' + it.severity.toLowerCase() + '">' + esc(it.severity) + '</td>';
      html += '<td>' + esc(it.description) + '</td>';
      html += '<td style="white-space:nowrap">' + esc(it.deadline) + '</td>';
      html += '<td>' + esc(it.status) + '</td>';
      html += '</tr>';
    });
    html += '</table></div>';
  }

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY
// ═══════════════════════════════════════════════════════════════════════════

function viewMemory(S) {
  var m = S.manifest || { milestones: [], knowledgeAssets: { rules: [], skills: [], hooks: [], decisions: [] }, memos: [], product: '', currentState: '' };
  var dec = S.decisions || { active: [], rejected: [] };

  var html = '<div class="page">';
  html += '<div class="section-header">💬 Stakeholder Memory</div>';
  html += '<p class="section-subtitle">What was discussed, decided, deferred, and denied — so nobody repeats themselves</p>';

  // Product context
  html += '<div class="page-section">';
  html += '<div class="card card--mint"><div class="card-header">🏷 Product</div>';
  html += '<div class="card-body">' + esc(m.product || 'No product description.') + '</div></div>';
  html += '</div>';

  // Concept Glossary
  if (m.glossary && m.glossary.length > 0) {
    html += '<div class="page-section">';
    html += '<div class="section-header">📖 Concept Glossary <span class="capsule capsule--sm capsule--info">' + m.glossary.length + '</span></div>';
    html += renderGlossary(m.glossary);
    html += '</div>';
  }

  // Current state
  if (m.currentState) {
    html += '<div class="page-section">';
    html += '<div class="card card--sky"><div class="card-header">📍 Current State</div>';
    html += '<div class="card-body">' + esc(m.currentState) + '</div></div>';
    html += '</div>';
  }

  // Conversation memos
  html += '<div class="page-section">';
  html += '<div class="section-header">🗒 Conversation Memos <span class="capsule capsule--sm capsule--info">' + m.memos.length + '</span></div>';
  html += renderMemoCards(m.memos);
  html += '</div>';

  // Architecture decisions
  html += '<div class="page-section">';
  html += '<div class="section-header">📐 Architecture Decisions</div>';
  html += '<div class="grid grid--2">';
  html += '<div><div class="section-subtitle">Active (' + dec.active.length + ')</div>' + renderADRList(dec.active, []) + '</div>';
  html += '<div><div class="section-subtitle">Rejected (' + dec.rejected.length + ')</div>' + renderADRList([], dec.rejected) + '</div>';
  html += '</div></div>';

  // Milestones
  html += '<div class="page-section">';
  html += '<div class="section-header">📋 Milestone Progress</div>';
  html += renderMilestones(m.milestones);
  html += '</div>';

  html += '</div>';
  return html;
}
