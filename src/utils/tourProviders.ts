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

function pootle_tour_enqueue() {
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
}
add_action( 'admin_enqueue_scripts', 'pootle_tour_enqueue' );
add_action( 'wp_enqueue_scripts', 'pootle_tour_enqueue' );
`;
}

function buildJsRunner(steps: TourStep[]): string {
  const stepsJson = JSON.stringify(steps);
  return `(function () {
  'use strict';

  var TOUR_STEPS = ${stepsJson};
  var STORAGE_KEY = 'pootle_tour_done';

  function makeDriverSteps(steps) {
    return steps.map(function (s) {
      return {
        element: s.selector || undefined,
        popover: { title: s.title, description: s.description },
      };
    });
  }

  function startTour() {
    if (!window.driver || !window.driver.js) return;
    var driverObj = window.driver.js.driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      steps: makeDriverSteps(TOUR_STEPS),
      onDestroyed: function () {
        localStorage.setItem(STORAGE_KEY, '1');
      },
    });
    driverObj.drive(0);
  }

  window.pootleRestartTour = function () {
    localStorage.removeItem(STORAGE_KEY);
    startTour();
  };

  function init() {
    var btn = document.getElementById('wp-admin-bar-pootle-tour-restart');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.pootleRestartTour();
      });
    }
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(startTour, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
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
        data: buildJsRunner(steps),
      },
    ];
  }
}

export const defaultTourProvider: TourProvider = new DriverJsProvider();
