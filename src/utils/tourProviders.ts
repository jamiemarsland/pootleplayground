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
    description: 'Customise your site\'s look and feel. Access the Site Editor, themes, menus, and widgets from here.',
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

const DRIVER_VERSION = '1.3.1';

function buildPhpPlugin(): string {
  return `<?php
/**
 * Plugin Name: Pootle Guided Tour
 * Description: Auto-start guided tour powered by Driver.js.
 * Version:     1.0.0
 */

add_action( 'admin_bar_menu', function ( WP_Admin_Bar $bar ) {
    $bar->add_node( [
        'id'    => 'pootle-tour-restart',
        'title' => '&#9654; Restart Tour',
        'href'  => '#',
        'meta'  => [ 'class' => 'pootle-tour-restart' ],
    ] );
}, 100 );

add_action( 'admin_enqueue_scripts', function () {
    wp_enqueue_script(
        'driver-js',
        'https://cdn.jsdelivr.net/npm/driver.js@${DRIVER_VERSION}/dist/driver.umd.min.js',
        [],
        '${DRIVER_VERSION}',
        true
    );
    wp_enqueue_style(
        'driver-js',
        'https://cdn.jsdelivr.net/npm/driver.js@${DRIVER_VERSION}/dist/driver.css',
        [],
        '${DRIVER_VERSION}'
    );
    wp_enqueue_script(
        'pootle-tour',
        content_url( 'mu-plugins/pootle-tour.js' ),
        [ 'driver-js' ],
        '1.0.0',
        true
    );
    wp_localize_script( 'pootle-tour', 'pootleTourConfig', [
        'dataUrl'    => content_url( 'uploads/pootle-tour.json' ),
        'storageKey' => 'pootle_tour_done',
    ] );
} );
`;
}

function buildJsRunner(): string {
  return `(function () {
  'use strict';

  var cfg = window.pootleTourConfig || {};

  function makeSteps(steps) {
    return steps.map(function (s) {
      return {
        element: s.selector || undefined,
        popover: { title: s.title, description: s.description },
      };
    });
  }

  function startTour(steps) {
    var d = window.driver.js.driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      steps: makeSteps(steps),
      onDestroyStarted: function () {
        localStorage.setItem(cfg.storageKey, '1');
        d.destroy();
      },
    });
    d.drive(0);
  }

  window.pootleRestartTour = function () {
    localStorage.removeItem(cfg.storageKey);
    loadAndRun();
  };

  function loadAndRun() {
    fetch(cfg.dataUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var steps = data.steps || [];
        if (steps.length) startTour(steps);
      })
      .catch(function (e) {
        console.warn('[Pootle Tour] Could not load tour data.', e);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('wp-admin-bar-pootle-tour-restart');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.pootleRestartTour();
      });
    }
    if (!localStorage.getItem(cfg.storageKey)) {
      setTimeout(loadAndRun, 800);
    }
  });
})();
`;
}

export class DriverJsProvider implements TourProvider {
  name = 'driver.js';

  generateFiles(config: TourConfig): TourFile[] {
    const steps = config.mode === 'quick' ? QUICK_INTRO_STEPS : config.steps;
    return [
      {
        path: '/wordpress/wp-content/mu-plugins/pootle-tour.php',
        data: buildPhpPlugin(),
      },
      {
        path: '/wordpress/wp-content/mu-plugins/pootle-tour.js',
        data: buildJsRunner(),
      },
      {
        path: '/wordpress/wp-content/uploads/pootle-tour.json',
        data: JSON.stringify({ steps }, null, 2),
      },
    ];
  }
}

export const defaultTourProvider: TourProvider = new DriverJsProvider();
