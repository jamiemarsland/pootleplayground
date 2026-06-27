export interface TourStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  url?: string;
  order: number;
}

export type TourMode = 'none' | 'quick' | 'custom';

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

function buildPhpPlugin(steps: TourStep[]): string {
  const stepsJson = JSON.stringify(steps).replace(/'/g, "\\'");

  return `<?php
/**
 * Plugin Name: Pootle Guided Tour
 * Description: Self-contained guided tour for this WordPress Playground.
 * Version:     1.0.0
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
#pt-spotlight {
  position: fixed;
  z-index: 9998;
  pointer-events: none;
  border-radius: 4px;
  transition: top .25s ease, left .25s ease, width .25s ease, height .25s ease;
  box-shadow: 0 0 0 9999px rgba(0,0,0,.62), 0 0 0 3px rgba(255,255,255,.45);
}
#pt-tooltip {
  position: fixed;
  z-index: 9999;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.14);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: top .25s ease, left .25s ease, opacity .2s ease;
  overflow: hidden;
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
  gap: 4px;
  flex: 1;
  justify-content: center;
}
#pt-tooltip .pt-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  transition: background .2s;
}
#pt-tooltip .pt-dot.active { background: #2271b1; }
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
  var STEPS = JSON.parse('${stepsJson}');
  var KEY   = 'pootle_tour_done';
  var idx   = 0;
  var spot  = null;
  var tip   = null;

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function build() {
    spot = document.createElement('div');
    spot.id = 'pt-spotlight';
    tip  = document.createElement('div');
    tip.id = 'pt-tooltip';
    document.body.appendChild(spot);
    document.body.appendChild(tip);
  }

  function dots() {
    return STEPS.map(function (_, i) {
      return '<span class="pt-dot' + (i === idx ? ' active' : '') + '"></span>';
    }).join('');
  }

  function render() {
    var s    = STEPS[idx];
    var last = idx === STEPS.length - 1;
    tip.innerHTML =
      '<div class="pt-head">' +
        '<span class="pt-progress">Step ' + (idx + 1) + ' of ' + STEPS.length + '</span>' +
        '<button class="pt-close" onclick="pootleTour.stop()" title="Close">&#x2715;</button>' +
      '</div>' +
      '<div class="pt-body">' +
        '<p class="pt-title">' + esc(s.title) + '</p>' +
        '<p class="pt-desc">'  + esc(s.description) + '</p>' +
        '<div class="pt-foot">' +
          '<button class="pt-btn pt-btn-prev" onclick="pootleTour.prev()"' + (idx === 0 ? ' disabled' : '') + '>&#8592; Back</button>' +
          '<div class="pt-dots">' + dots() + '</div>' +
          (last
            ? '<button class="pt-btn pt-btn-done" onclick="pootleTour.stop()">Done &#10003;</button>'
            : '<button class="pt-btn pt-btn-next" onclick="pootleTour.next()">Next &#8594;</button>') +
        '</div>' +
      '</div>';
  }

  function position() {
    var s  = STEPS[idx];
    var el = s.selector ? document.querySelector(s.selector) : null;
    if (!el) { el = document.body; }

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    var r   = el.getBoundingClientRect();
    var pad = 6;
    spot.style.top    = (r.top  - pad) + 'px';
    spot.style.left   = (r.left - pad) + 'px';
    spot.style.width  = (r.width  + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';
    spot.style.display = 'block';

    var tw  = 320;
    var th  = tip.offsetHeight || 200;
    var gap = 14;
    var vp  = { w: window.innerWidth, h: window.innerHeight };

    var tleft = Math.max(12, Math.min(r.left, vp.w - tw - 12));
    var ttop;
    if (r.bottom + gap + th <= vp.h - 12) {
      ttop = r.bottom + gap;
    } else if (r.top - gap - th >= 12) {
      ttop = r.top - gap - th;
    } else {
      ttop = Math.max(12, vp.h / 2 - th / 2);
    }
    tip.style.top     = ttop + 'px';
    tip.style.left    = tleft + 'px';
    tip.style.opacity = '1';
    tip.style.display = 'block';
  }

  function show(i) {
    idx = i;
    render();
    position();
  }

  window.pootleTour = {
    start: function () {
      if (!tip) build();
      show(0);
    },
    restart: function () {
      localStorage.removeItem(KEY);
      if (!tip) build();
      show(0);
    },
    next: function () {
      if (idx < STEPS.length - 1) show(idx + 1);
    },
    prev: function () {
      if (idx > 0) show(idx - 1);
    },
    stop: function () {
      localStorage.setItem(KEY, '1');
      if (spot) spot.style.display = 'none';
      if (tip)  tip.style.display  = 'none';
    },
  };

  function wireRestartBtn() {
    var btn = document.getElementById('wp-admin-bar-pootle-tour-restart');
    if (btn) {
      var a = btn.querySelector('a');
      if (a) a.onclick = function (e) { e.preventDefault(); pootleTour.restart(); };
    }
  }

  function autoStart(attempts) {
    if (localStorage.getItem(KEY) || !STEPS.length) return;
    var anchor = STEPS[0].selector ? document.querySelector(STEPS[0].selector) : document.body;
    if (anchor) {
      wireRestartBtn();
      pootleTour.start();
    } else if (attempts < 20) {
      setTimeout(function () { autoStart(attempts + 1); }, 500);
    }
  }

  function init() {
    wireRestartBtn();
    if (!localStorage.getItem(KEY) && STEPS.length) {
      autoStart(0);
    }
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
    const steps = config.mode === 'quick' ? QUICK_INTRO_STEPS : config.steps;
    return [
      {
        path: '/wordpress/wp-content/mu-plugins/pootle-tour.php',
        data: buildPhpPlugin(steps),
      },
    ];
  }
}

export const defaultTourProvider: TourProvider = new DriverJsProvider();
