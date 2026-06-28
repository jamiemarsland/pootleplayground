export interface TourStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  url?: string;
  order: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export type TourMode = 'none' | 'quick' | 'quickstart' | 'custom';

export interface TourConfig {
  mode: TourMode;
  steps: TourStep[];
}

export interface TourFile {
  path: string;
  data: string;
}

export interface TourProvider {
  name: string;
  generateFiles(config: TourConfig): TourFile[];
}

export const QUICK_INTRO_STEPS: TourStep[] = [
  {
    id: 'qi-1',
    title: 'Welcome to Your WordPress Site',
    description: 'This is the WordPress admin dashboard — your control centre for managing your website. The left sidebar lets you navigate every section.',
    selector: '#wpadminbar',
    url: '/wp-admin/',
    order: 1,
  },
  {
    id: 'qi-2',
    title: 'Dashboard',
    description: 'Your at-a-glance overview of site activity, recent posts, and important updates.',
    selector: '#menu-dashboard',
    url: '/wp-admin/',
    order: 2,
  },
  {
    id: 'qi-3',
    title: 'Pages',
    description: 'Create and manage the static pages of your site — homepage, about, contact, and more.',
    selector: '#menu-pages',
    url: '/wp-admin/',
    order: 3,
  },
  {
    id: 'qi-4',
    title: 'Appearance',
    description: "Customise your site's look and feel. Access the Site Editor, themes, menus, and widgets from here.",
    selector: '#menu-appearance',
    url: '/wp-admin/',
    order: 4,
  },
  {
    id: 'qi-5',
    title: 'Plugins',
    description: 'Extend your site with plugins. Install from WordPress.org or upload your own ZIP files.',
    selector: '#menu-plugins',
    url: '/wp-admin/',
    order: 5,
  },
];

export const QUICK_START_STEPS: TourStep[] = [
  // ── Phase 1: Site Structure ──────────────────────────
  {
    id: 'qs-1',
    title: 'Phase 1 of 4 — Create Your Site Structure',
    description: "Before designing anything, build your main pages. Pages hold content that doesn't change often — like a Homepage, About, or Contact page.",
    selector: '#menu-pages',
    url: '/wp-admin/edit.php?post_type=page',
    order: 1,
    side: 'right',
  },
  {
    id: 'qs-2',
    title: 'Create 4 Pages',
    description: 'Click "Add New Page" and create: Home, About, Contact, and Blog. Give each a title and click Publish. Return here once all four are created.',
    selector: '.page-title-action',
    url: '/wp-admin/edit.php?post_type=page',
    order: 2,
    side: 'bottom',
  },
  {
    id: 'qs-3',
    title: 'Site Structure Ready',
    description: 'Great — you now have the basic structure of a website. Your pages list should show Home, About, Contact, and Blog. Click Next to learn about editing page content.',
    selector: '.wp-list-table',
    url: '/wp-admin/edit.php?post_type=page',
    order: 3,
    side: 'top',
  },
  // ── Phase 2: Block Editor ────────────────────────────
  {
    id: 'qs-4',
    title: 'Phase 2 of 4 — The Block Editor',
    description: "Open your Home page to edit it. WordPress uses blocks — every piece of content (headings, paragraphs, images) is a block you can move and style independently.",
    selector: '.edit-post-layout',
    url: '/wp-admin/post-new.php?post_type=page',
    order: 4,
    side: 'top',
  },
  {
    id: 'qs-5',
    title: 'The Block Inserter (+)',
    description: 'Click the + button (top-left of the toolbar) to browse and add any type of block — headings, images, buttons, columns, and hundreds more. This is how you build pages.',
    selector: '.edit-post-header-toolbar',
    url: '/wp-admin/post-new.php?post_type=page',
    order: 5,
    side: 'bottom',
  },
  {
    id: 'qs-6',
    title: 'The Writing Canvas',
    description: 'This is your page canvas. Click to start typing or press + to add blocks. Try adding a Heading block with your site name, then a Paragraph block beneath it.',
    selector: '.block-editor-writing-flow',
    url: '/wp-admin/post-new.php?post_type=page',
    order: 6,
    side: 'top',
  },
  {
    id: 'qs-7',
    title: 'Block & Page Settings',
    description: 'The right sidebar shows settings for the selected block or the whole page — typography, colours, spacing, and page-level options like templates.',
    selector: '.interface-complementary-area',
    url: '/wp-admin/post-new.php?post_type=page',
    order: 7,
    side: 'left',
  },
  {
    id: 'qs-8',
    title: 'Block Editor Mastered',
    description: "Most WordPress content creation happens here. When you're done editing, click Update or Publish. Click Next to set up your navigation.",
    selector: '.edit-post-header',
    url: '/wp-admin/post-new.php?post_type=page',
    order: 8,
    side: 'bottom',
  },
  // ── Phase 3: Navigation ──────────────────────────────
  {
    id: 'qs-9',
    title: 'Phase 3 of 4 — Build Your Navigation',
    description: 'Navigation menus help visitors move around your site. Go to Appearance and look for Navigation (block themes) or Menus (classic themes).',
    selector: '#menu-appearance',
    url: '/wp-admin/',
    order: 9,
    side: 'right',
  },
  {
    id: 'qs-10',
    title: 'Add Your Menu Links',
    description: 'Add links to Home, About, Blog, and Contact, then save the navigation. Your visitors can now move between the main sections of your site.',
    selector: '#menu-appearance',
    url: '/wp-admin/',
    order: 10,
    side: 'right',
  },
  // ── Phase 4: Reading Settings ────────────────────────
  {
    id: 'qs-11',
    title: 'Phase 4 of 4 — Set Your Homepage',
    description: "By default WordPress shows your latest posts on the front page. Go to Settings → Reading to choose a static page as your homepage instead.",
    selector: '#menu-settings',
    url: '/wp-admin/options-reading.php',
    order: 11,
    side: 'right',
  },
  {
    id: 'qs-12',
    title: 'Choose a Static Page',
    description: 'Under Your homepage displays, select A static page. Set Homepage to your Home page and Posts page to your Blog page, then click Save Changes.',
    selector: '.wrap form',
    url: '/wp-admin/options-reading.php',
    order: 12,
    side: 'top',
  },
  // ── Completion ───────────────────────────────────────
  {
    id: 'qs-13',
    title: 'You\'re all set!',
    description: "You've completed the essential WordPress setup: created your site structure, learned the block editor, built a navigation menu, and configured your homepage. That's the core workflow used by millions of WordPress sites.",
    selector: '#wpadminbar',
    url: '/wp-admin/',
    order: 13,
    side: 'bottom',
  },
];

function tourHash(steps: TourStep[]): string {
  const str = steps.map(s => s.id).join(',');
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function buildPhpPlugin(steps: TourStep[]): string {
  // Escape backslashes first (JSON.stringify emits \" for double quotes inside strings;
  // embedding that in a single-quoted JS string would unescap it → invalid JSON.parse input).
  // Order matters: backslashes must be doubled before single-quotes are escaped.
  const stepsJson = JSON.stringify(steps)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
  const tourKey   = `pootle_tour_${tourHash(steps)}`;

  return `<?php
/**
 * Plugin Name: Pootle Guided Tour
 * Description: Self-contained guided tour for this WordPress Playground.
 * Version:     2.0.0
 */

add_action( 'admin_bar_menu', function ( WP_Admin_Bar $bar ) {
    if ( ! is_user_logged_in() ) return;
    $bar->add_node( [
        'id'    => 'pootle-tour-restart',
        'title' => '&#9654; Restart Tour',
        'href'  => '#',
        'meta'  => [ 'onclick' => 'event.preventDefault(); pootleTour.restart();' ],
    ] );
}, 100 );

function pootle_tour_assets() {
    if ( ! is_user_logged_in() ) return;
    ?>
<style id="pootle-tour-css">
/* SVG overlay */
#pt-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 9998;
  pointer-events: none;
  display: none;
}
#pt-cutout {
  transition: x .28s ease, y .28s ease, width .28s ease, height .28s ease;
}
/* Arrow */
#pt-arrow {
  position: fixed;
  z-index: 10000;
  width: 14px;
  height: 14px;
  background: #fff;
  transform: rotate(45deg);
  pointer-events: none;
  display: none;
  transition: top .28s ease, left .28s ease;
}
#pt-arrow.pa-bottom { box-shadow: -2px -2px 4px rgba(0,0,0,.10); }
#pt-arrow.pa-top    { box-shadow: 2px 2px 4px rgba(0,0,0,.10); }
#pt-arrow.pa-right  { box-shadow: -2px 2px 4px rgba(0,0,0,.10); }
#pt-arrow.pa-left   { box-shadow: 2px -2px 4px rgba(0,0,0,.10); }
/* Tooltip */
#pt-tooltip {
  position: fixed;
  z-index: 9999;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.14);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: top .28s ease, left .28s ease, opacity .18s ease;
  overflow: hidden;
  display: none;
}
#pt-tooltip .pt-head {
  background: #1d2327;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
#pt-tooltip .pt-progress {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,.55);
  letter-spacing: .04em;
  text-transform: uppercase;
}
#pt-tooltip .pt-close {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,.5);
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background .15s;
}
#pt-tooltip .pt-close:hover { background: rgba(255,255,255,.12); color: #fff; }
#pt-tooltip .pt-body { padding: 16px; }
#pt-tooltip .pt-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1d2327;
  line-height: 1.3;
}
#pt-tooltip .pt-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #50575e;
  line-height: 1.6;
}
#pt-tooltip .pt-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
#pt-tooltip .pt-dots {
  display: flex;
  gap: 5px;
  flex: 1;
  justify-content: center;
}
#pt-tooltip .pt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: background .2s, transform .2s;
}
#pt-tooltip .pt-dot:hover { background: #aaa; }
#pt-tooltip .pt-dot.active { background: #2271b1; transform: scale(1.2); }
#pt-tooltip .pt-btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, opacity .15s;
  font-family: inherit;
}
#pt-tooltip .pt-btn-prev { background: #f0f0f1; color: #1d2327; }
#pt-tooltip .pt-btn-prev:hover { background: #ddd; }
#pt-tooltip .pt-btn-next { background: #2271b1; color: #fff; }
#pt-tooltip .pt-btn-next:hover { background: #135e96; }
#pt-tooltip .pt-btn-done { background: #00a32a; color: #fff; }
#pt-tooltip .pt-btn-done:hover { background: #008a20; }
#pt-tooltip .pt-btn:disabled { opacity: .4; cursor: default; }
</style>
<script id="pootle-tour-js">
(function () {
  var STEPS   = JSON.parse('${stepsJson}');
  var KEY     = '${tourKey}';
  var IDX_KEY = '${tourKey}_idx';
  var idx     = 0;
  var active  = false;
  var overlay = null;
  var cutout  = null;
  var tip     = null;
  var arrowEl = null;

  /* ── helpers ─────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function opp(side) {
    return { top:'bottom', bottom:'top', left:'right', right:'left' }[side];
  }

  /* Returns true when the given step url matches the current page */
  function urlMatches(stepUrl) {
    if (!stepUrl) return true;
    var cur = window.location.pathname + window.location.search;
    /* Normalise: strip trailing slash, lowercase */
    function norm(u) { return u.replace(/\\/+$/, '').toLowerCase(); }
    return norm(cur) === norm(stepUrl);
  }

  /* Navigate to a step that lives on a different page */
  function navigateTo(i) {
    localStorage.setItem(IDX_KEY, String(i));
    window.location.href = STEPS[i].url || window.location.href;
  }

  /* ── DOM construction ────────────────────────────────── */
  function build() {
    var NS = 'http://www.w3.org/2000/svg';

    overlay = document.createElementNS(NS, 'svg');
    overlay.setAttribute('id', 'pt-overlay');
    overlay.setAttribute('xmlns', NS);

    var defs = document.createElementNS(NS, 'defs');
    var mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', 'pt-hole');

    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('fill', 'white');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');

    cutout = document.createElementNS(NS, 'rect');
    cutout.setAttribute('id', 'pt-cutout');
    cutout.setAttribute('fill', 'black');
    cutout.setAttribute('rx', '5');
    cutout.setAttribute('ry', '5');

    mask.appendChild(bg);
    mask.appendChild(cutout);
    defs.appendChild(mask);
    overlay.appendChild(defs);

    var fill = document.createElementNS(NS, 'rect');
    fill.setAttribute('fill', 'rgba(0,0,0,0.65)');
    fill.setAttribute('width', '100%');
    fill.setAttribute('height', '100%');
    fill.setAttribute('mask', 'url(#pt-hole)');
    overlay.appendChild(fill);

    document.body.appendChild(overlay);

    arrowEl = document.createElement('div');
    arrowEl.id = 'pt-arrow';
    document.body.appendChild(arrowEl);

    tip = document.createElement('div');
    tip.id = 'pt-tooltip';
    document.body.appendChild(tip);
  }

  /* ── render tooltip HTML ─────────────────────────────── */
  function render() {
    var s    = STEPS[idx];
    var last = idx === STEPS.length - 1;
    tip.innerHTML =
      '<div class="pt-head">' +
        '<span class="pt-progress">Step ' + (idx + 1) + ' of ' + STEPS.length + '</span>' +
        '<button class="pt-close" onclick="pootleTour.stop()" title="Close (Esc)">&#x2715;</button>' +
      '</div>' +
      '<div class="pt-body">' +
        '<p class="pt-title">' + esc(s.title) + '</p>' +
        '<p class="pt-desc">'  + esc(s.description) + '</p>' +
        '<div class="pt-foot">' +
          '<button class="pt-btn pt-btn-prev" onclick="pootleTour.prev()"' +
            (idx === 0 ? ' disabled' : '') + '>&#8592; Back</button>' +
          '<div class="pt-dots">' +
            STEPS.map(function (_, i) {
              return '<span class="pt-dot' + (i === idx ? ' active' : '') +
                '" onclick="pootleTour.show(' + i + ')"></span>';
            }).join('') +
          '</div>' +
          (last
            ? '<button class="pt-btn pt-btn-done" onclick="pootleTour.stop()">Done &#10003;</button>'
            : '<button class="pt-btn pt-btn-next" onclick="pootleTour.next()">Next &#8594;</button>') +
        '</div>' +
      '</div>';
  }

  /* ── smart positioning ───────────────────────────────── */
  function position() {
    var s   = STEPS[idx];
    var el  = s.selector ? document.querySelector(s.selector) : null;
    if (!el) el = document.body;

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    var r    = el.getBoundingClientRect();
    var pad  = 8;
    var cx   = r.left + r.width  / 2;
    var cy   = r.top  + r.height / 2;
    var vp   = { w: window.innerWidth, h: window.innerHeight };

    /* update SVG cutout */
    var cx0 = Math.round(r.left - pad);
    var cy0 = Math.round(r.top  - pad);
    var cw  = Math.round(r.width  + pad * 2);
    var ch  = Math.round(r.height + pad * 2);
    cutout.style.x      = cx0 + 'px';
    cutout.style.y      = cy0 + 'px';
    cutout.style.width  = cw  + 'px';
    cutout.style.height = ch  + 'px';

    /* smart side selection */
    var tw   = 320;
    var th   = tip.offsetHeight || 200;
    var gap  = 16;
    var vpad = 12;

    var preferred = s.side || null;
    var align     = s.align || 'center';

    /* auto-detect when no preference */
    if (!preferred) {
      var spaceBelow = vp.h - (r.bottom + pad);
      var spaceAbove = r.top - pad;
      var spaceRight = vp.w - (r.right  + pad);
      var spaceLeft  = r.left - pad;
      var spaces     = [
        { side: 'bottom', room: spaceBelow },
        { side: 'top',    room: spaceAbove },
        { side: 'right',  room: spaceRight },
        { side: 'left',   room: spaceLeft  },
      ];
      spaces.sort(function (a, b) { return b.room - a.room; });
      preferred = spaces[0].side;
    }

    var order = [preferred, opp(preferred), 'bottom', 'top', 'right', 'left'];
    var seen  = {}, sides = [];
    order.forEach(function (sd) { if (!seen[sd]) { seen[sd] = true; sides.push(sd); } });

    var placed = null;
    for (var i = 0; i < sides.length; i++) {
      var side = sides[i];
      var tl, tt;
      var cutB = r.bottom + pad, cutT = r.top  - pad;
      var cutR = r.right  + pad, cutL = r.left - pad;

      if (side === 'bottom' || side === 'top') {
        if (align === 'start')       tl = cutL;
        else if (align === 'end')    tl = cutR - tw;
        else                         tl = cx - tw / 2;
        tl = Math.max(vpad, Math.min(tl, vp.w - tw - vpad));
        tt = side === 'bottom' ? cutB + gap : cutT - gap - th;
      } else {
        if (align === 'start')       tt = r.top;
        else if (align === 'end')    tt = r.bottom - th;
        else                         tt = cy - th / 2;
        tt = Math.max(vpad, Math.min(tt, vp.h - th - vpad));
        tl = side === 'right' ? cutR + gap : cutL - gap - tw;
      }

      var fits = tl >= vpad && tl + tw <= vp.w - vpad &&
                 tt >= vpad && tt + th <= vp.h - vpad;

      if (fits || i === sides.length - 1) {
        placed = { side: side, left: tl, top: tt };
        break;
      }
    }

    /* position arrow */
    var half = 7;
    var al, at;
    if (placed.side === 'bottom') {
      al = cx   - half;
      at = placed.top - half;
    } else if (placed.side === 'top') {
      al = cx   - half;
      at = placed.top + th - half;
    } else if (placed.side === 'right') {
      al = placed.left - half;
      at = cy    - half;
    } else {
      al = placed.left + tw - half;
      at = cy    - half;
    }
    arrowEl.style.left = Math.round(al) + 'px';
    arrowEl.style.top  = Math.round(at) + 'px';
    arrowEl.className  = 'pa-' + placed.side;

    tip.style.left    = Math.round(placed.left) + 'px';
    tip.style.top     = Math.round(placed.top)  + 'px';
  }

  /* ── show a step ─────────────────────────────────────── */
  function show(i) {
    idx = i;
    var s = STEPS[i];

    /* If this step belongs on a different page, navigate there */
    if (s.url && !urlMatches(s.url)) {
      navigateTo(i);
      return;
    }

    if (!active) {
      /* first show: just appear */
      tip.style.opacity = '0';
      tip.style.display = 'block';
      arrowEl.style.display = 'block';
      overlay.style.display = 'block';
      render();
      setTimeout(function () {
        position();
        tip.style.opacity = '1';
      }, 30);
    } else {
      /* subsequent: fade out → reposition → fade in */
      tip.style.opacity = '0';
      setTimeout(function () {
        render();
        setTimeout(function () {
          position();
          tip.style.opacity = '1';
        }, 30);
      }, 160);
    }
    active = true;
  }

  /* ── keyboard navigation ─────────────────────────────── */
  function onKey(e) {
    if (!active) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < STEPS.length - 1) window.pootleTour.next();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) window.pootleTour.prev();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      window.pootleTour.stop();
    }
  }

  /* ── public API ──────────────────────────────────────── */
  window.pootleTour = {
    start: function () {
      if (!tip) build();
      active = false;
      show(0);
      document.addEventListener('keydown', onKey);
    },
    restart: function () {
      localStorage.removeItem(KEY);
      localStorage.removeItem(IDX_KEY);
      if (!tip) build();
      active = false;
      /* If step 0 is on a different page, navigate there first */
      if (STEPS.length && STEPS[0].url && !urlMatches(STEPS[0].url)) {
        navigateTo(0);
        return;
      }
      show(0);
      document.addEventListener('keydown', onKey);
    },
    next: function () {
      if (idx < STEPS.length - 1) show(idx + 1);
    },
    prev: function () {
      if (idx > 0) show(idx - 1);
    },
    show: function (i) {
      if (i >= 0 && i < STEPS.length) show(i);
    },
    stop: function () {
      localStorage.setItem(KEY, '1');
      localStorage.removeItem(IDX_KEY);
      active = false;
      if (overlay)  overlay.style.display  = 'none';
      if (tip)      tip.style.display      = 'none';
      if (arrowEl)  arrowEl.style.display  = 'none';
      document.removeEventListener('keydown', onKey);
    },
  };

  /* ── auto-start ──────────────────────────────────────── */
  function wireRestartBtn() {
    var btn = document.getElementById('wp-admin-bar-pootle-tour-restart');
    if (btn) {
      var a = btn.querySelector('a');
      if (a) a.onclick = function (e) { e.preventDefault(); window.pootleTour.restart(); };
    }
  }

  function autoStart(attempts) {
    if (localStorage.getItem(KEY) || !STEPS.length) return;
    var anchor = STEPS[0].selector ? document.querySelector(STEPS[0].selector) : document.body;
    if (anchor) {
      wireRestartBtn();
      window.pootleTour.start();
    } else if (attempts < 20) {
      setTimeout(function () { autoStart(attempts + 1); }, 500);
    }
  }

  function init() {
    wireRestartBtn();
    if (localStorage.getItem(KEY)) return; /* tour was dismissed */
    if (!STEPS.length) return;

    /* Resume mid-tour after a page navigation */
    var pending = localStorage.getItem(IDX_KEY);
    if (pending !== null) {
      var resumeIdx = parseInt(pending, 10);
      localStorage.removeItem(IDX_KEY);
      if (resumeIdx >= 0 && resumeIdx < STEPS.length) {
        if (!tip) build();
        active = false;
        document.addEventListener('keydown', onKey);
        /* Wait for the page elements to be ready */
        function tryResume(attempts) {
          var s = STEPS[resumeIdx];
          var anchor = s.selector ? document.querySelector(s.selector) : document.body;
          if (anchor) {
            wireRestartBtn();
            show(resumeIdx);
          } else if (attempts < 20) {
            setTimeout(function () { tryResume(attempts + 1); }, 500);
          } else {
            show(resumeIdx); /* show anyway, falls back to body */
          }
        }
        tryResume(0);
        return;
      }
    }

    autoStart(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();
</script>
    <?php
}
add_action( 'admin_footer',  'pootle_tour_assets' );
add_action( 'wp_footer',     'pootle_tour_assets' );
`;
}

export class DriverJsProvider implements TourProvider {
  name = 'driver.js';

  generateFiles(config: TourConfig): TourFile[] {
    const steps = config.mode === 'quick'
      ? QUICK_INTRO_STEPS
      : config.mode === 'quickstart'
      ? QUICK_START_STEPS
      : config.steps;
    return [
      {
        path: '/wordpress/wp-content/mu-plugins/pootle-tour.php',
        data: buildPhpPlugin(steps),
      },
    ];
  }
}

export const defaultTourProvider: TourProvider = new DriverJsProvider();
