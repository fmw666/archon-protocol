/**
 * Workflow topology renderer — file cards, phase cards, SVG lines,
 * live agent highlight, floating agent panel.
 */

/* global WF_FILES, WF_MODES, esc, elapsed, PHASE_LABELS, renderLifecycleTrack, S */

var _wfMode = 'demand';
var _agentFloatOpen = false;

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: Main workflow canvas
// ═══════════════════════════════════════════════════════════════════════════

function renderWorkflow(state) {
  var mode = WF_MODES[_wfMode];
  if (!mode) return '<div class="page"><p>Unknown mode.</p></div>';

  var html = '';

  // Tab bar
  html += '<div class="wf-tabs">';
  var modeKeys = ['demand', 'plan', 'review'];
  for (var mi = 0; mi < modeKeys.length; mi++) {
    var mk = modeKeys[mi];
    var m = WF_MODES[mk];
    var activeCls = mk === _wfMode ? ' wf-tab--active' : '';
    html += '<button class="wf-tab' + activeCls + '" data-wfmode="' + mk + '">';
    html += m.icon + ' ' + m.label;
    html += '</button>';
  }
  html += '</div>';

  // Legend
  html += '<div class="wf-legend">';
  html += '<span><span class="wf-legend-line" style="background:#66BB6A"></span>READ</span>';
  html += '<span><span class="wf-legend-line" style="background:#EF5350"></span>WRITE</span>';
  html += '<span><span class="wf-legend-line" style="background:#F59E0B"></span>R + W</span>';
  html += '</div>';

  // Grid container for topology
  html += '<div class="wf-grid" id="wf-grid">';

  // Top file zone — core governance files
  html += '<div class="wf-zone wf-zone--top">';
  html += '<div class="wf-zone-label pixel">Core Governance .archon</div>';
  html += '<div class="wf-zone-cards">';
  for (var ti = 0; ti < mode.topFiles.length; ti++) {
    html += renderFileCard(mode.topFiles[ti], state);
  }
  html += '</div></div>';

  // Flow label
  html += '<div class="wf-flow-label pixel">Execution Pipeline →</div>';

  // Phase row
  html += '<div class="wf-flow-row">';
  var activeSessions = (state.sessions || []).filter(function(s) { return s.phase !== 'idle'; });
  var activePhase = activeSessions.length > 0 ? activeSessions[0].phase : null;

  for (var pi = 0; pi < mode.phases.length; pi++) {
    if (pi > 0) html += '<div class="wf-flow-arrow">▸</div>';
    html += renderPhaseCard(mode.phases[pi], activePhase, mode.phases, pi);
  }
  html += '</div>';

  // Bottom file zone — grouped by category
  html += '<div class="wf-zone wf-zone--bot">';
  for (var gi = 0; gi < mode.botGroups.length; gi++) {
    var grp = mode.botGroups[gi];
    html += '<div class="wf-file-group">';
    html += '<div class="wf-group-label">' + esc(grp.label) + '</div>';
    html += '<div class="wf-group-cards">';
    for (var fi = 0; fi < grp.files.length; fi++) {
      html += renderFileCard(grp.files[fi], state);
    }
    html += '</div></div>';
  }
  html += '</div>';

  // SVG overlay
  html += '<svg class="wf-lines" id="wf-lines"></svg>';

  html += '</div>'; // end wf-grid

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: File card (Brutalist style)
// ═══════════════════════════════════════════════════════════════════════════

function renderFileCard(fileKey, state) {
  var f = WF_FILES[fileKey];
  if (!f) return '';

  var liveInfo = getFileLiveInfo(fileKey, state);

  var html = '<div class="wf-fcard" style="border-left-color:' + f.border + '">';
  html += '<div class="wf-fcard-hdr">';
  html += '<span class="wf-fcard-icon">' + f.icon + '</span>';
  html += '<span class="wf-fcard-name">' + esc(f.name) + '</span>';
  html += '<span class="wf-fcard-grp">' + esc(f.group) + '</span>';
  html += '</div>';

  var secs = f.sections;
  var secKeys = Object.keys(secs);
  for (var i = 0; i < secKeys.length; i++) {
    var secId = secKeys[i];
    var label = secs[secId];
    var liveVal = liveInfo[secId] || '';
    html += '<div class="wf-sec" data-secid="' + secId + '">';
    html += '<span class="wf-sec-dot" style="background:' + f.border + '"></span>';
    html += '<span class="wf-sec-text">' + esc(label) + '</span>';
    if (liveVal) html += '<span class="wf-sec-live">' + esc(liveVal) + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function getFileLiveInfo(fileKey, state) {
  var info = {};
  if (!state) return info;
  var d = state.drift;
  var debt = state.debt;
  var m = state.manifest;

  if (fileKey === 'drift' && d) {
    info['dr-val'] = d.current + '/' + d.threshold;
    info['dr-log'] = d.logs ? d.logs.length + ' entries' : '';
  }
  if (fileKey === 'debt' && debt) {
    var pending = debt.items ? debt.items.filter(function(i) { return i.status !== 'resolved'; }).length : 0;
    info['db-table'] = pending + ' pending';
  }
  if (fileKey === 'manifest' && m) {
    if (m.milestones && m.milestones.length) {
      var cur = m.milestones.find(function(ms) { return ms.status === '🔧'; }) || m.milestones[m.milestones.length - 1];
      if (cur) info['mf-milestone'] = cur.id + ' ' + Math.round((cur.checks.done / Math.max(1, cur.checks.total)) * 100) + '%';
    }
    if (m.knowledgeAssets) {
      var ka = m.knowledgeAssets;
      info['mf-asset'] = ka.rules.length + 'R ' + ka.skills.length + 'S ' + ka.hooks.length + 'H';
    }
  }
  if (fileKey === 'memos' && m && m.memos) {
    info['mm-table'] = m.memos.length + ' entries';
  }
  return info;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER: Phase card (Brutalist style)
// ═══════════════════════════════════════════════════════════════════════════

function renderPhaseCard(phase, activePhase, allPhases, idx) {
  var isActive = activePhase && phase.mapPhase === activePhase;
  var currentPhaseIdx = -1;
  if (activePhase) {
    for (var i = 0; i < allPhases.length; i++) {
      if (allPhases[i].mapPhase === activePhase) { currentPhaseIdx = i; break; }
    }
  }
  var isDone = activePhase && currentPhaseIdx > idx;
  var cardCls = 'wf-pcard';
  if (isActive && !isDone) cardCls += ' wf-pcard--active';
  if (isDone) cardCls += ' wf-pcard--done';

  var html = '<div class="' + cardCls + '" data-phase="' + phase.id + '">';
  html += '<div class="wf-pcard-hdr">';
  html += '<span class="wf-pcard-num" style="background:' + phase.accent + '">' + (idx + 1) + '</span>';
  html += '<span class="wf-pcard-title">' + esc(phase.label) + '</span>';
  html += '</div>';
  for (var si = 0; si < phase.steps.length; si++) {
    var step = phase.steps[si];
    html += '<div class="wf-step" data-sid="' + step.id + '">';
    html += '<span class="wf-step-icon">' + step.icon + '</span>';
    html += esc(step.label);
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG LINE DRAWING — ported from workflow.html
// ═══════════════════════════════════════════════════════════════════════════

function drawWorkflowLines() {
  var grid = document.getElementById('wf-grid');
  var svg = document.getElementById('wf-lines');
  if (!grid || !svg) return;

  var mode = WF_MODES[_wfMode];
  if (!mode) return;

  var gr = grid.getBoundingClientRect();
  svg.setAttribute('width', grid.scrollWidth);
  svg.setAttribute('height', grid.scrollHeight);
  svg.innerHTML = '';

  // Arrow markers
  var ns = 'http://www.w3.org/2000/svg';
  var defs = document.createElementNS(ns, 'defs');
  var colors = ['#66BB6A', '#EF5350', '#F59E0B'];
  for (var ci = 0; ci < colors.length; ci++) {
    var c = colors[ci];
    var marker = document.createElementNS(ns, 'marker');
    marker.setAttribute('id', 'wf-ah-' + c.slice(1));
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '5');
    marker.setAttribute('refX', '5');
    marker.setAttribute('refY', '2.5');
    marker.setAttribute('orient', 'auto');
    var pg = document.createElementNS(ns, 'polygon');
    pg.setAttribute('points', '0 0, 6 2.5, 0 5');
    pg.setAttribute('fill', c);
    marker.appendChild(pg);
    defs.appendChild(marker);
  }
  svg.appendChild(defs);

  var conns = mode.conns;
  var flowRow = grid.querySelector('.wf-flow-row');
  if (!flowRow) return;
  var flowMidY = flowRow.getBoundingClientRect().top + flowRow.getBoundingClientRect().height / 2 - gr.top;

  var fromCnt = {}, toCnt = {}, fromIdx = {}, toIdx = {};
  for (var i = 0; i < conns.length; i++) {
    fromCnt[conns[i][0]] = (fromCnt[conns[i][0]] || 0) + 1;
    toCnt[conns[i][1]] = (toCnt[conns[i][1]] || 0) + 1;
  }

  for (var j = 0; j < conns.length; j++) {
    var conn = conns[j];
    var fromEl = grid.querySelector('[data-sid="' + conn[0] + '"]');
    var toEl = grid.querySelector('[data-secid="' + conn[1] + '"]');
    if (!fromEl || !toEl) continue;

    var fr = fromEl.getBoundingClientRect();
    var tr = toEl.getBoundingClientRect();
    var isTop = (tr.top + tr.height / 2 - gr.top) < flowMidY;

    if (!fromIdx[conn[0]]) fromIdx[conn[0]] = 0;
    var fi = fromIdx[conn[0]]++;
    var fn = fromCnt[conn[0]];
    var fxOff = (fi - (fn - 1) / 2) * 5;
    var fx = fr.left + fr.width / 2 - gr.left + fxOff;
    var fy = isTop ? (fr.top - gr.top) : (fr.bottom - gr.top);

    if (!toIdx[conn[1]]) toIdx[conn[1]] = 0;
    var ti = toIdx[conn[1]]++;
    var tn = toCnt[conn[1]];
    var txOff = (ti - (tn - 1) / 2) * 5;
    var tx = tr.left + tr.width / 2 - gr.left + txOff;
    var ty = isTop ? (tr.bottom - gr.top) : (tr.top - gr.top);

    var colorMap = { r: '#66BB6A', w: '#EF5350', rw: '#F59E0B' };
    var lineColor = colorMap[conn[2]] || '#66BB6A';
    var dist = Math.abs(fy - ty);
    var cp = dist * 0.38;
    var cy1 = isTop ? fy - cp : fy + cp;
    var cy2 = isTop ? ty + cp : ty - cp;
    var d = 'M' + fx + ',' + fy + ' C' + fx + ',' + cy1 + ' ' + tx + ',' + cy2 + ' ' + tx + ',' + ty;

    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', lineColor);
    p.setAttribute('marker-end', 'url(#wf-ah-' + lineColor.slice(1) + ')');
    p.dataset.from = conn[0];
    p.dataset.to = conn[1];
    p.dataset.type = conn[2];
    p.dataset.note = conn[3] || '';
    svg.appendChild(p);
  }

  bindWorkflowLineEvents(svg);
}

function bindWorkflowLineEvents(svg) {
  var paths = svg.querySelectorAll('path');
  var tip = document.getElementById('wf-tip');
  var grid = document.getElementById('wf-grid');

  for (var i = 0; i < paths.length; i++) {
    (function(p) {
      p.addEventListener('mouseenter', function(e) {
        var lbl = { r: 'READ', w: 'WRITE', rw: 'R+W' }[p.dataset.type] || '';
        var clr = { r: '#66BB6A', w: '#EF5350', rw: '#F59E0B' }[p.dataset.type] || '#666';
        if (tip) {
          tip.innerHTML = '<span style="color:' + clr + ';font-weight:700">' + lbl + '</span> → ' + esc(p.dataset.note);
          tip.classList.add('wf-tip--show');
        }
        for (var j = 0; j < paths.length; j++) paths[j].classList.add('wf-line--dim');
        p.classList.remove('wf-line--dim');
        p.classList.add('wf-line--hl');
        hlWorkflowNode(grid, p.dataset.from, true);
        hlWorkflowNode(grid, p.dataset.to, true);
      });
      p.addEventListener('mousemove', function(e) {
        if (tip) { tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY - 28 + 'px'; }
      });
      p.addEventListener('mouseleave', function() {
        if (tip) tip.classList.remove('wf-tip--show');
        for (var j = 0; j < paths.length; j++) {
          paths[j].classList.remove('wf-line--dim', 'wf-line--hl');
        }
        var hls = grid.querySelectorAll('.wf-hl');
        for (var k = 0; k < hls.length; k++) hls[k].classList.remove('wf-hl');
      });
    })(paths[i]);
  }
}

function hlWorkflowNode(grid, id, on) {
  var el = grid.querySelector('[data-sid="' + id + '"]') || grid.querySelector('[data-secid="' + id + '"]');
  if (el) { if (on) el.classList.add('wf-hl'); else el.classList.remove('wf-hl'); }
}

// Click-to-highlight
function onWorkflowClick(e) {
  var step = e.target.closest('.wf-step');
  var sec = e.target.closest('.wf-sec');
  var id = step ? step.dataset.sid : (sec ? sec.dataset.secid : null);
  if (!id) return;

  var svg = document.getElementById('wf-lines');
  if (!svg) return;
  var paths = svg.querySelectorAll('path');
  var any = false;
  for (var i = 0; i < paths.length; i++) {
    var match = paths[i].dataset.from === id || paths[i].dataset.to === id;
    if (match) any = true;
    paths[i].classList.toggle('wf-line--hl', match);
    paths[i].classList.toggle('wf-line--dim', !match);
  }
  if (!any) {
    for (var j = 0; j < paths.length; j++) {
      paths[j].classList.remove('wf-line--dim', 'wf-line--hl');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING AGENT PANEL
// ═══════════════════════════════════════════════════════════════════════════

function renderAgentFloat(state) {
  var el = document.getElementById('agent-float');
  if (!el) return;

  var sessions = (state.sessions || []).filter(function(s) { return s.phase !== 'idle'; });

  if (sessions.length === 0) {
    el.innerHTML = '<div class="af-collapsed af-collapsed--idle" onclick="toggleAgentFloat()">' +
      '<span class="af-dot af-dot--idle"></span>' +
      '<span class="af-label pixel">IDLE</span></div>';
    el.classList.remove('agent-float--open');
    return;
  }

  if (!_agentFloatOpen) {
    el.innerHTML = '<div class="af-collapsed" onclick="toggleAgentFloat()">' +
      '<span class="af-dot af-dot--active"></span>' +
      '<span class="af-label pixel">' + sessions.length + ' ACTIVE</span></div>';
    el.classList.remove('agent-float--open');
    return;
  }

  el.classList.add('agent-float--open');
  var html = '<div class="af-header">';
  html += '<span class="af-label pixel">' + sessions.length + ' ACTIVE</span>';
  html += '<button class="af-close" onclick="toggleAgentFloat()">✕</button>';
  html += '</div>';

  for (var i = 0; i < sessions.length; i++) {
    var s = sessions[i];
    var phaseLabel = (PHASE_LABELS && PHASE_LABELS[s.phase]) || s.phase.toUpperCase();
    html += '<div class="af-session">';
    html += '<div class="af-session-top">';
    html += '<span class="af-dot af-dot--active"></span>';
    html += '<span class="mono" style="font-size:10px">' + esc((s.sessionId || '').slice(0, 8)) + '</span>';
    html += '<span class="capsule capsule--sm capsule--green">' + esc(phaseLabel) + '</span>';
    html += '</div>';
    if (s.demand) html += '<div class="af-demand">' + esc(s.demand.slice(0, 60)) + '</div>';
    if (s._eventCount) html += '<div class="af-meta">' + s._eventCount + ' events · ' + esc(s._lastTool || '') + '</div>';
    var traceLink = s._transcriptId || s.sessionId || s._file || '';
    if (traceLink) html += '<a href="#/trace/' + esc(traceLink) + '" class="af-trace-link">View Trace →</a>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function toggleAgentFloat() {
  _agentFloatOpen = !_agentFloatOpen;
  if (typeof S !== 'undefined') renderAgentFloat(S);
}

// ═══════════════════════════════════════════════════════════════════════════
// LIVE HIGHLIGHT: auto-highlight active agent's phase connections
// ═══════════════════════════════════════════════════════════════════════════

function highlightActivePhaseLines(state) {
  var svg = document.getElementById('wf-lines');
  if (!svg) return;

  var sessions = (state.sessions || []).filter(function(s) { return s.phase !== 'idle'; });
  if (sessions.length === 0) return;

  var activePhase = sessions[0].phase;
  var mode = WF_MODES[_wfMode];
  if (!mode) return;

  var activeStepIds = {};
  for (var pi = 0; pi < mode.phases.length; pi++) {
    if (mode.phases[pi].mapPhase === activePhase) {
      for (var si = 0; si < mode.phases[pi].steps.length; si++) {
        activeStepIds[mode.phases[pi].steps[si].id] = true;
      }
    }
  }

  var paths = svg.querySelectorAll('path');
  for (var i = 0; i < paths.length; i++) {
    if (activeStepIds[paths[i].dataset.from]) {
      paths[i].classList.add('wf-line--live');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST-RENDER HOOK: wire up events after DOM insertion
// ═══════════════════════════════════════════════════════════════════════════

function initWorkflowEvents() {
  // Tab switching
  var tabs = document.querySelectorAll('.wf-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function(e) {
      var newMode = this.getAttribute('data-wfmode');
      if (newMode && newMode !== _wfMode) {
        _wfMode = newMode;
        if (typeof render === 'function') render();
      }
    });
  }

  // Click-to-highlight on steps/sections
  var grid = document.getElementById('wf-grid');
  if (grid) grid.addEventListener('click', onWorkflowClick);

  // Draw lines after layout settles
  requestAnimationFrame(function() {
    drawWorkflowLines();
    if (typeof S !== 'undefined') highlightActivePhaseLines(S);
    setTimeout(drawWorkflowLines, 200);
  });
}
