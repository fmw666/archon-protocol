/**
 * App entry — router, state management, SSE, sidebar, slide panel.
 */

/* global renderGauge, renderDebtBadges, renderMilestoneBadge, renderSessionStatus,
   viewTimeline, viewKnowledge, viewDebt, viewMemory,
   viewHistory, viewTrace, viewSessionTrace,
   renderWorkflow, renderAgentFloat, initWorkflowEvents,
   PHASE_LABELS, LIFECYCLE_STEPS */

var S = {};
var currentView = 'workflow';
var currentParam = null;
var _slidePanelOpen = false;
var _slidePanelView = null;

// ── Utilities ──

function esc(str) {
  var el = document.createElement('span');
  el.textContent = String(str || '');
  return el.innerHTML;
}

function elapsed(iso) {
  if (!iso) return '';
  var diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return Math.round(diff / 1000) + 's ago';
  if (diff < 3600000) return Math.round(diff / 60000) + 'min ago';
  return Math.round(diff / 3600000) + 'h ago';
}

function patchEl(id, html) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// ── Router ──

function navigateTo(view, param) {
  currentView = view;
  currentParam = param || null;
  if ((view === 'session' || view === 'trace') && param) {
    window.location.hash = '#/' + view + '/' + param;
  } else if (view === 'workflow') {
    window.location.hash = '#/';
  } else {
    window.location.hash = '#/' + view;
  }
  updateSidebar();
  renderView();
}

function handleHashChange() {
  var hash = window.location.hash || '#/';
  var parts = hash.replace('#/', '').split('/');
  var view = parts[0] || 'workflow';

  var panelViews = ['timeline', 'knowledge', 'debt', 'memory', 'history'];

  if (view === 'session' || view === 'trace') {
    currentView = view;
    currentParam = parts.slice(1).join('/');
    closeSidePanel();
  } else if (panelViews.indexOf(view) >= 0) {
    currentView = 'workflow';
    currentParam = null;
    openSidePanel(view);
  } else {
    currentView = 'workflow';
    currentParam = null;
    closeSidePanel();
  }
  updateSidebar();
  renderView();
}

function updateSidebar() {
  var links = document.querySelectorAll('.sidebar-link');
  for (var i = 0; i < links.length; i++) {
    var panel = links[i].getAttribute('data-panel');
    var isActive = (currentView === 'workflow' && panel === 'workflow' && !_slidePanelOpen) ||
      (_slidePanelOpen && _slidePanelView === panel);
    links[i].classList.toggle('sidebar-link--active', isActive);
  }
}

// ── Slide Panel ──

function openSidePanel(view) {
  _slidePanelOpen = true;
  _slidePanelView = view;
  var overlay = document.getElementById('slide-overlay');
  var panel = document.getElementById('slide-panel');
  if (overlay) overlay.classList.add('slide-overlay--show');
  if (panel) panel.classList.add('slide-panel--show');

  var titles = {
    timeline: '📊 Delivery Timeline',
    knowledge: '🧠 Knowledge Map',
    debt: '🔴 Debt Tracker',
    memory: '💬 Stakeholder Memory',
    history: '📜 Conversation History'
  };
  patchEl('slide-panel-title', titles[view] || view);

  var bodyHtml = '';
  switch (view) {
    case 'timeline': bodyHtml = viewTimeline(S); break;
    case 'knowledge': bodyHtml = viewKnowledge(S); break;
    case 'debt': bodyHtml = viewDebt(S); break;
    case 'memory': bodyHtml = viewMemory(S); break;
    case 'history': bodyHtml = viewHistory(S); break;
  }
  patchEl('slide-panel-body', bodyHtml);
  updateSidebar();
}

function closeSidePanel() {
  _slidePanelOpen = false;
  _slidePanelView = null;
  var overlay = document.getElementById('slide-overlay');
  var panel = document.getElementById('slide-panel');
  if (overlay) overlay.classList.remove('slide-overlay--show');
  if (panel) panel.classList.remove('slide-panel--show');
  updateSidebar();
}

// ── Render ──

function renderTopbar() {
  var d = S.drift || { current: 0, threshold: 12 };
  patchEl('drift-gauge', renderGauge(d.current, d.threshold));
  patchEl('debt-badges', renderDebtBadges(S.debt));
  patchEl('milestone-badge', renderMilestoneBadge(S.manifest));
  patchEl('session-status', renderSessionStatus(S.sessions));
}

function renderView() {
  var html = '';
  switch (currentView) {
    case 'workflow':
      html = '<div class="page wf-page">' + renderWorkflow(S) + '</div>';
      break;
    case 'session':
      html = viewSessionTrace(S, currentParam);
      break;
    case 'trace':
      html = viewTrace(S, currentParam);
      break;
    default:
      html = '<div class="page wf-page">' + renderWorkflow(S) + '</div>';
  }
  patchEl('app', html);

  if (currentView === 'workflow') {
    initWorkflowEvents();
  }
}

function render() {
  renderTopbar();
  renderAgentFloat(S);
  renderView();

  // Keep slide panel content fresh if open
  if (_slidePanelOpen && _slidePanelView) {
    var bodyHtml = '';
    switch (_slidePanelView) {
      case 'timeline': bodyHtml = viewTimeline(S); break;
      case 'knowledge': bodyHtml = viewKnowledge(S); break;
      case 'debt': bodyHtml = viewDebt(S); break;
      case 'memory': bodyHtml = viewMemory(S); break;
    }
    if (bodyHtml) patchEl('slide-panel-body', bodyHtml);
  }
}

// ── Data Fetching ──

function fetchState() {
  fetch('/api/state')
    .then(function(r) { return r.json(); })
    .then(function(data) { S = data; render(); })
    .catch(function() {});
}

function setupSSE() {
  var es = new EventSource('/sse');
  es.onmessage = function(ev) {
    try {
      var msg = JSON.parse(ev.data);
      if (msg.type === 'update') fetchState();
    } catch(e) {}
  };
  es.onerror = function() {
    es.close();
    setTimeout(setupSSE, 3000);
  };
}

// ── Elapsed timer ──

setInterval(function() {
  if (S.sessions && S.sessions.length > 0) render();
}, 30000);

// ── Redraw lines on resize ──

window.addEventListener('resize', function() {
  if (currentView === 'workflow') {
    if (typeof drawWorkflowLines === 'function') drawWorkflowLines();
  }
});

// ── Init ──

document.addEventListener('DOMContentLoaded', function() {
  // Slide panel close
  var closeBtn = document.getElementById('slide-panel-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSidePanel);
  var overlay = document.getElementById('slide-overlay');
  if (overlay) overlay.addEventListener('click', closeSidePanel);

  // Sidebar link clicks
  var links = document.querySelectorAll('.sidebar-link');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
      var panel = this.getAttribute('data-panel');
      if (panel === 'workflow') {
        e.preventDefault();
        closeSidePanel();
        navigateTo('workflow');
      }
    });
  }
});

window.addEventListener('hashchange', handleHashChange);
fetchState();
setupSSE();
handleHashChange();
