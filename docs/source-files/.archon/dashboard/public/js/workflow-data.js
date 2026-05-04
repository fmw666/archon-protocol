/**
 * Workflow topology data — files, modes, phases, connections.
 * Adapted from scripts/workflow-data.js for browser use.
 */

/* exported WF_FILES, WF_MODES */

var WF_FILES = {
  soul:{name:'soul.md',icon:'🧠',group:'.archon/',color:'#f0e6ff',border:'#b388ff',sections:{
    'soul-core':'Core Axioms · 5 identity bedrock','soul-own':'Ownership · memo citation','soul-loop':'Cognitive loop',
    'soul-auto':'Autonomy principles','soul-tech':'Technical sovereignty',
    'soul-evo':'Evolution · triggers · crystallization · capsules','soul-reflect':'Reflection · recursive application · 3 questions · blindspot table',
    'soul-hook':'Lifecycle hooks · panoramic table · delegation','soul-quality':'Quality discipline · 10 principles',
    'soul-guard':'Guardrail system · constraint pyramid L0-L3','soul-hygiene':'Knowledge hygiene · budget',
    'soul-comm':'Communication contract + Persona',
  }},
  manifest:{name:'manifest.md',icon:'📋',group:'.archon/',color:'#fff4e0',border:'#ffb74d',sections:{
    'mf-platform':'Platform mapping table','mf-product':'Product + business model','mf-tech':'Tech stack · 15 items',
    'mf-validate':'Validation command + structural guards','mf-git':'Git strategy','mf-dir':'Directory structure',
    'mf-asset':'Knowledge assets index','mf-milestone':'Milestones M0-M4','mf-status':'Current state + convergence scope + review conclusion',
    'mf-memo-ptr':'Memo pointer → memos.md',
  }},
  drift:{name:'drift.md',icon:'📊',group:'.archon/',color:'#e0f7e9',border:'#66bb6a',sections:{
    'dr-val':'Current value drift: N','dr-rule':'Rules · tiered light 6 / full 12 / emergency 20 (convergence phase 14)','dr-log':'Log · summary|score|capture|total',
  }},
  debt:{name:'debt.md',icon:'⚠️',group:'.archon/',color:'#fce4ec',border:'#ef5350',sections:{
    'db-rule':'Cleanup rule · 40-line threshold','db-table':'Debt table · ID|severity|deadline|status',
  }},
  memos:{name:'memos.md',icon:'💬',group:'.archon/',color:'#e0f2f1',border:'#26a69a',sections:{
    'mm-table':'Memo table · topic|conclusion|rationale','mm-limit':'≤10 entries · overflow trim',
  }},
  demand:{name:'archon-demand.md',icon:'⚡',group:'commands/',color:'#fff8e1',border:'#ffc107',sections:{
    'dm-bridge':'Hot-path · soul/manifest sections+soul/delivery','dm-scan':'Pre-scan · memos+archive recall+decisions+extensions',
    'dm-fastpath':'Fast-Path qualification · ≤2 files + no new pattern/module/governance',
    'dm-gate1':'Decision gate · Verdict + Plan-mode binding (ADR-11) + Convergence gate (ADR-12)','dm-exec':'Self-directed execution interior','dm-verify':'Validation gate','dm-wrap':'Close-out 9 steps · Blink Dispatch · Architecture Forecast · Close-Out',
  }},
  plan:{name:'archon-plan.md',icon:'🗺️',group:'commands/',color:'#e8f5e9',border:'#66bb6a',sections:{
    'pl-bridge':'Hot-path · soul/manifest sections+drift+backlog','pl-sense':'State perception 4 dimensions',
    'pl-reflect':'Proactive scrutiny 3 questions + tech adoption probes','pl-priority':'Priority ranking rules','pl-output':'Output format · 3-5 work items',
  }},
  review:{name:'archon-review.md',icon:'🔬',group:'commands/',color:'#fce4ec',border:'#ef5350',sections:{
    'rv-bridge':'Hot-path · soul/manifest sections+drift','rv-auto':'Phase 0 automated checks',
    'rv-reviewer':'Phase 1 launch reviewer','rv-audit':'Phase 2 knowledge health audit',
    'rv-fix':'Phase 3 remediation','rv-wrap':'Phase 4 close-out + drift reset',
  }},
  archonCmd:{name:'archon.md',icon:'🔀',group:'commands/',color:'#fff8e1',border:'#ffc107',sections:{
    'ac-route':'Routing table · explicit+implicit','ac-drift':'Drift pre-check',
  }},
  auditor:{name:'capture-auditor.md',icon:'🔍',group:'agents/',color:'#ede7f6',border:'#9575cd',sections:{
    'au-job':'4 duties · capture|blindspot|hygiene|compliance','au-proto':'Protocol 6 steps',
    'au-output':'Output · 4 tables + recommendations','au-adv':'Adversarial challenge',
  }},
  reviewer:{name:'archon-reviewer.md',icon:'🏗️',group:'agents/',color:'#ede7f6',border:'#9575cd',sections:{
    'rw-ctx':'Phase 1 load context','rw-invest':'Phase 2 investigate source',
    'rw-report':'Phase 3 report · Critical/Warning/Obs','rw-comply':'Compliance check 13 items',
    'rw-frame':'Framework completeness 5 items',
  }},
  hbRule:{name:'heartbeat.mdc',icon:'💗',group:'rules/',color:'#e3f2fd',border:'#42a5f5',sections:{
    'hb-phase':'Write timing · 6 phases','hb-json':'JSON format + sub-agent',
  }},
  arRule:{name:'archon.mdc',icon:'🔒',group:'rules/',color:'#e3f2fd',border:'#42a5f5',sections:{
    'ar-decouple':'Decoupling rules + prohibited content',
  }},
  gitSkill:{name:'git-commit/SKILL.md',icon:'📝',group:'skills/',color:'#f1f8e9',border:'#8bc34a',sections:{
    'gs-format':'Conventional Commits · type table','gs-flow':'4-step workflow',
  }},
  decisions:{name:'decisions.md',icon:'🏛️',group:'.archon/',color:'#f3e5f5',border:'#ec407a',sections:{
    'dec-adr':'Project ADR ledger (product, stack, and local architecture decisions)',
  }},
  heartbeat:{name:'heartbeats/{sid}.json',icon:'📡',group:'dashboard/',color:'#e8eaf6',border:'#7986cb',sections:{
    'hb-file':'session · phase · subagents',
  }},
  backlog:{name:'backlog.md',icon:'📦',group:'docs/product/',color:'#fff8e1',border:'#ffc107',sections:{
    'bl-pool':'Requirement pool + feature specs',
  }},
  knowledge:{name:'Knowledge Assets (dynamic)',icon:'💎',group:'rules/skills/docs',color:'#f5f5f5',border:'#bdbdbd',sections:{
    'kn-any':'Dynamically created/updated per auditor recommendations',
  }},
  source:{name:'Project Source',icon:'💻',group:'web/ api/',color:'#f5f5f5',border:'#bdbdbd',sections:{
    'src-code':'Source files read/written per demand',
  }},
};

var WF_MODES = {
  demand: {
    label:'Demand Delivery', accent:'#ff9800', icon:'⚡',
    topFiles:['soul','manifest','drift','debt','memos'],
    botGroups:[
      {label:'Commands',files:['demand','archonCmd']},
      {label:'Agents',files:['auditor']},
      {label:'Rules',files:['hbRule','arRule','knowledge']},
      {label:'Skills',files:['gitSkill']},
      {label:'Docs',files:['decisions']},
      {label:'Dashboard',files:['heartbeat']},
      {label:'Runtime',files:['source']},
    ],
    phases:[
      {id:'d0',label:'Boot',accent:'#b388ff',mapPhase:'started',steps:[
        {id:'d0s0',label:'Load cognitive core',icon:'🧠'},
        {id:'d0s1',label:'Load project context',icon:'📋'},
        {id:'d0s2',label:'Load delivery workflow',icon:'⚡'},
        {id:'d0s3',label:'Drift pre-check',icon:'📊'},
      ]},
      {id:'d1',label:'Pre-scan',accent:'#26a69a',mapPhase:'started',steps:[
        {id:'d1s0',label:'Scan stakeholder memos + archive recall',icon:'💬'},
        {id:'d1s1',label:'Scan architecture decisions',icon:'🏛️'},
        {id:'d1s2',label:'Fast-Path qualification self-assess',icon:'⚡'},
      ]},
      {id:'d2',label:'Decision Gate',accent:'#ff7043',mapPhase:'decision-gate',steps:[
        {id:'d2s0',label:'Evaluate demand',icon:'🔎'},
        {id:'d2s0b',label:'Convergence scope check (ADR-12)',icon:'🎯'},
        {id:'d2s1',label:'⛩ Verdict output (ADR-11 Plan-mode bound)',icon:'🚧'},
        {id:'d2s2',label:'Rejection / out-of-scope capture',icon:'✍️'},
      ]},
      {id:'d3',label:'Self-directed Execute',accent:'#42a5f5',mapPhase:'executing',steps:[
        {id:'d3s0',label:'Plan tools + apply changes',icon:'💻'},
        {id:'d3s1',label:'Heartbeat write',icon:'💗'},
      ]},
      {id:'d4',label:'Validation Gate',accent:'#66bb6a',mapPhase:'validating',steps:[
        {id:'d4s0',label:'Get validation command',icon:'📋'},
        {id:'d4s1',label:'npm run validate',icon:'✅'},
      ]},
      {id:'d5',label:'Close-out',accent:'#ef5350',mapPhase:'wrapping-up',steps:[
        {id:'d5s1',label:'❶ Manifest sync + glossary',icon:'📋'},
        {id:'d5s2',label:'❷ Blink Dispatch gate',icon:'🔍'},
        {id:'d5s3',label:'❸ Conditional sub-agent output',icon:'📥'},
        {id:'d5s4',label:'❹ Drift update + forecast + floor',icon:'📊'},
        {id:'d5s5',label:'❺ Milestone gate',icon:'🚪'},
        {id:'d5s6',label:'❻ Stakeholder memos + archive',icon:'💬'},
        {id:'d5s65',label:'❼ Extensions close-out hooks',icon:'🔌'},
        {id:'d5s7',label:'❽ Version control',icon:'📝'},
        {id:'d5s8',label:'⛩ Close-Out output',icon:'🚧'},
      ]},
    ],
    conns:[
      ['d0s0','soul-core','r','Hot-path sections — cognitive core'],
      ['d0s1','mf-tech','r','Hot-path sections — project context'],
      ['d0s2','dm-bridge','r','Hot-path — delivery workflow'],
      ['d0s3','dr-val','r','§Current Value — check ≥12'],
      ['d1s0','mm-table','r','Full table — historical conclusions + archive recall'],
      ['d1s1','dec-adr','r','On-demand ADR lookup'],
      ['d1s2','dm-fastpath','r','Fast-Path eligibility (ADR-9)'],
      ['d2s0b','mf-status','r','§Convergence scope — M3 debt IDs'],
      ['d2s1','dm-gate1','r','Verdict format + Plan-mode binding + Convergence gate'],
      ['d2s2','dec-adr','w','Append Negative ADR / log out-of-scope rejection'],
      ['d3s0','dm-exec','r','Boundary-hard/process-soft execution interior'],
      ['d3s0','src-code','w','Self-directed demand changes'],
      ['d3s1','hb-file','w','phase: executing'],
      ['d3s1','hb-phase','r','Write timing table'],
      ['d4s0','mf-validate','r','§Validation Command'],
      ['d5s1','mf-tech','rw','§Tech stack/directory/state'],
      ['d5s1','mf-asset','rw','§Knowledge assets index'],
      ['d5s1','mf-milestone','rw','§Milestones'],
      ['d5s1','mf-status','rw','§Current state'],
      ['d5s2','au-job','r','Conditional read after Blink Dispatch'],
      ['d5s2','soul-evo','r','Auditor reads: trigger conditions'],
      ['d5s2','soul-quality','r','Auditor reads: quality discipline'],
      ['d5s2','soul-reflect','r','Auditor reads: blindspot table'],
      ['d5s3','kn-any','w','Crystallize knowledge assets'],
      ['d5s3','mf-asset','w','Sync index'],
      ['d5s3','db-table','w','Register debt'],
      ['d5s4','dr-val','rw','Update drift current value'],
      ['d5s4','dr-log','w','Append log entry + architecture forecast'],
      ['d5s5','mf-milestone','r','Check acceptance criteria'],
      ['d5s5','db-table','r','Debt clearance check'],
      ['d5s6','mm-table','w','Append decision conclusion + cold archive overflow'],
      ['d5s65','soul-hook','r','demand.close-out extension hooks'],
      ['d5s7','mf-git','r','§Git strategy'],
      ['d5s7','gs-format','r','Commit convention'],
      ['d5s8','dm-wrap','r','Close-Out format'],
    ],
  },
  plan: {
    label:'Plan Mode', accent:'#66bb6a', icon:'🗺️',
    topFiles:['soul','manifest','drift','debt','memos'],
    botGroups:[
      {label:'Commands',files:['plan','archonCmd']},
      {label:'Docs',files:['backlog','decisions']},
    ],
    phases:[
      {id:'l0',label:'Boot',accent:'#b388ff',mapPhase:'started',steps:[
        {id:'l0s0',label:'Load cognitive core',icon:'🧠'},
        {id:'l0s1',label:'Load project context',icon:'📋'},
        {id:'l0s2',label:'Load drift',icon:'📊'},
        {id:'l0s3',label:'Load planning workflow',icon:'🗺️'},
        {id:'l0s4',label:'Load requirement pool',icon:'📦'},
      ]},
      {id:'l1',label:'State Perception',accent:'#26a69a',mapPhase:'executing',steps:[
        {id:'l1s0',label:'Milestone progress',icon:'🎯'},
        {id:'l1s1',label:'Known issues',icon:'⚠️'},
        {id:'l1s2',label:'Tech debt analysis',icon:'📊'},
        {id:'l1s3',label:'Requirement pool scan',icon:'📦'},
      ]},
      {id:'l2',label:'Proactive Scrutiny',accent:'#ff7043',mapPhase:'executing',steps:[
        {id:'l2s0',label:'3 questions: coverage/recursive/blindspot',icon:'🔎'},
        {id:'l2s1',label:'Tech adoption probes',icon:'🔬'},
      ]},
      {id:'l3',label:'Priority Ranking',accent:'#42a5f5',mapPhase:'executing',steps:[
        {id:'l3s0',label:'Infer bias from state',icon:'⚖️'},
        {id:'l3s1',label:'5-level ranking rules',icon:'📐'},
      ]},
      {id:'l4',label:'Output',accent:'#66bb6a',mapPhase:'wrapping-up',steps:[
        {id:'l4s0',label:'Current state summary',icon:'📄'},
        {id:'l4s1',label:'3-5 ranked work items',icon:'📋'},
        {id:'l4s2',label:'Risks and considerations',icon:'🚨'},
      ]},
    ],
    conns:[
      ['l0s0','soul-core','r','Hot-path sections — cognitive core'],
      ['l0s1','mf-tech','r','Hot-path sections — project context'],
      ['l0s2','dr-val','r','Current value + log patterns'],
      ['l0s2','dr-log','r','Recent 5 delivery patterns'],
      ['l0s3','pl-bridge','r','Hot-path — planning workflow'],
      ['l0s4','bl-pool','r','Requirement pool'],
      ['l1s0','mf-milestone','r','Acceptance criteria per-item check'],
      ['l1s1','mf-status','r','Review conclusion + known issues'],
      ['l1s2','db-table','r','Debt full table'],
      ['l1s2','dr-log','r','Delivery pattern analysis'],
      ['l1s3','bl-pool','r','Unscheduled requirements'],
      ['l2s0','soul-reflect','r','Proactive scrutiny 3 questions'],
      ['l2s1','mf-tech','r','Tech stack per-item scan'],
      ['l2s1','mf-asset','r','Existing skill coverage'],
      ['l3s0','soul-evo','r','§Evolution tempo signal table'],
      ['l3s0','dr-log','r','Recent delivery patterns'],
    ],
  },
  review: {
    label:'Full Review', accent:'#ef5350', icon:'🔬',
    topFiles:['soul','manifest','drift','debt','memos'],
    botGroups:[
      {label:'Commands',files:['review','archonCmd']},
      {label:'Agents',files:['reviewer']},
      {label:'Rules',files:['knowledge']},
      {label:'Docs',files:['decisions']},
      {label:'Runtime',files:['source']},
    ],
    phases:[
      {id:'r0',label:'Boot',accent:'#b388ff',mapPhase:'started',steps:[
        {id:'r0s0',label:'Load cognitive core',icon:'🧠'},
        {id:'r0s1',label:'Load project context',icon:'📋'},
        {id:'r0s2',label:'Load drift',icon:'📊'},
        {id:'r0s3',label:'Load review workflow',icon:'🔬'},
      ]},
      {id:'r1',label:'Phase 0 · Automated Checks',accent:'#66bb6a',mapPhase:'validating',steps:[
        {id:'r1s0',label:'Run validation command',icon:'✅'},
        {id:'r1s1',label:'Red → fix → green',icon:'🔧'},
      ]},
      {id:'r2',label:'Phase 1 · Independent Review',accent:'#9575cd',mapPhase:'executing',steps:[
        {id:'r2s0',label:'Launch reviewer sub-agent',icon:'🏗️'},
        {id:'r2s1',label:'Review report Critical/Warning',icon:'📋'},
      ]},
      {id:'r3',label:'Phase 2 · Knowledge Health Audit',accent:'#26a69a',mapPhase:'executing',steps:[
        {id:'r3s0',label:'Index consistency check',icon:'🔍'},
        {id:'r3s1',label:'Governance ratio + capture rate',icon:'📊'},
        {id:'r3s2',label:'Coverage + stale cleanup',icon:'🧹'},
      ]},
      {id:'r4',label:'Phase 3 · Remediation',accent:'#ff7043',mapPhase:'executing',steps:[
        {id:'r4s0',label:'Fix Critical + Warning',icon:'🔧'},
        {id:'r4s1',label:'Re-validate',icon:'✅'},
      ]},
      {id:'r45',label:'Phase 3.5 · next-review debt disposition (ADR-12)',accent:'#ff9800',mapPhase:'executing',steps:[
        {id:'r45s0',label:'Enumerate next-review debts',icon:'📑'},
        {id:'r45s1',label:'Disposition: execute / defer / observe / reject',icon:'⚖️'},
      ]},
      {id:'r48',label:'Phase 4 · Memory Layer Consolidation',accent:'#26a69a',mapPhase:'executing',steps:[
        {id:'r48s0',label:'Memos cold-archive overflow',icon:'🗄️'},
        {id:'r48s1',label:'Debt table stale cleanup',icon:'🧹'},
      ]},
      {id:'r5',label:'Phase 5 · Close-out',accent:'#ef5350',mapPhase:'wrapping-up',steps:[
        {id:'r5s0',label:'Manifest full sync + convergence scope',icon:'📋'},
        {id:'r5s1',label:'Drift reset',icon:'📊'},
        {id:'r5s2',label:'Output review report',icon:'📄'},
      ]},
    ],
    conns:[
      ['r0s0','soul-core','r','Hot-path sections — cognitive core'],
      ['r0s1','mf-tech','r','Hot-path sections — project context'],
      ['r0s2','dr-val','r','Current value + full log'],
      ['r0s3','rv-bridge','r','Hot-path — review workflow'],
      ['r1s0','mf-validate','r','§Validation Command'],
      ['r1s1','src-code','rw','Fix automated issues'],
      ['r2s0','rw-ctx','r','On-demand read → launch reviewer'],
      ['r2s0','soul-quality','r','Reviewer reads: quality principles'],
      ['r2s0','soul-reflect','r','Reviewer reads: 3 questions + blindspots'],
      ['r2s0','mf-asset','r','Reviewer reads: knowledge index'],
      ['r2s0','src-code','r','Reviewer reads: source investigation'],
      ['r3s0','mf-asset','r','Knowledge index vs disk'],
      ['r3s1','dr-log','r','Compute capture rate'],
      ['r3s2','kn-any','rw','Clean stale assets'],
      ['r4s0','src-code','rw','Fix Critical/Warning'],
      ['r4s1','mf-validate','r','Validation command'],
      ['r45s0','db-table','r','Filter deadline=next-review'],
      ['r45s1','db-table','w','Update status + disposition note'],
      ['r48s0','mm-table','rw','Migrate oldest memos to archive'],
      ['r48s1','db-table','rw','Purge resolved/obsolete items'],
      ['r5s0','mf-tech','rw','Full sync manifest'],
      ['r5s0','mf-asset','rw','Sync knowledge index'],
      ['r5s0','mf-status','rw','Update review conclusion + convergence scope'],
      ['r5s0','mf-milestone','rw','Update milestones'],
      ['r5s1','dr-val','w','Reset drift'],
      ['r5s1','dr-log','w','Write review reset line'],
    ],
  },
};
