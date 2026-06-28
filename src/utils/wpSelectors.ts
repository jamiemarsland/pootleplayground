export interface WpSelectorEntry {
  label: string;
  selector: string;
  category: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  url?: string;
}

export const WP_SELECTOR_LIBRARY: WpSelectorEntry[] = [
  // Admin Bar
  { category: 'Admin Bar', label: 'Admin bar', selector: '#wpadminbar', side: 'bottom', url: '/wp-admin/' },
  { category: 'Admin Bar', label: '"New" button', selector: '#wp-admin-bar-new-content', side: 'bottom', url: '/wp-admin/' },
  { category: 'Admin Bar', label: 'Site name', selector: '#wp-admin-bar-site-name', side: 'bottom', url: '/wp-admin/' },
  { category: 'Admin Bar', label: 'Howdy / profile menu', selector: '#wp-admin-bar-my-account', side: 'bottom', url: '/wp-admin/' },

  // Sidebar
  { category: 'Sidebar', label: 'Full sidebar', selector: '#adminmenu', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Dashboard', selector: '#menu-dashboard', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Posts', selector: '#menu-posts', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Media', selector: '#menu-media', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Pages', selector: '#menu-pages', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Comments', selector: '#menu-comments', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Appearance', selector: '#menu-appearance', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Plugins', selector: '#menu-plugins', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Users', selector: '#menu-users', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Tools', selector: '#menu-tools', side: 'right', url: '/wp-admin/' },
  { category: 'Sidebar', label: 'Settings', selector: '#menu-settings', side: 'right', url: '/wp-admin/' },

  // Dashboard
  { category: 'Dashboard', label: 'Widgets area', selector: '#dashboard-widgets-wrap', side: 'top', url: '/wp-admin/' },
  { category: 'Dashboard', label: 'At a Glance widget', selector: '#dashboard_right_now', side: 'right', url: '/wp-admin/' },
  { category: 'Dashboard', label: 'Activity widget', selector: '#dashboard_activity', side: 'right', url: '/wp-admin/' },
  { category: 'Dashboard', label: 'Quick Draft widget', selector: '#dashboard_quick_press', side: 'left', url: '/wp-admin/' },

  // Content Area
  { category: 'Content Area', label: 'Main content area', selector: '#wpbody-content', side: 'top', url: '/wp-admin/' },
  { category: 'Content Area', label: 'Page title heading', selector: '.wrap h1', side: 'bottom', url: '/wp-admin/' },
  { category: 'Content Area', label: 'Add New button', selector: '.page-title-action', side: 'bottom', url: '/wp-admin/edit.php' },
  { category: 'Content Area', label: 'List table', selector: '.wp-list-table', side: 'top', url: '/wp-admin/edit.php' },
  { category: 'Content Area', label: 'Table navigation', selector: '.tablenav.top', side: 'bottom', url: '/wp-admin/edit.php' },

  // Block Editor
  { category: 'Block Editor', label: 'Editor layout', selector: '.edit-post-layout', side: 'top', url: '/wp-admin/post-new.php' },
  { category: 'Block Editor', label: 'Post title', selector: '.editor-post-title', side: 'bottom', url: '/wp-admin/post-new.php' },
  { category: 'Block Editor', label: 'Top toolbar', selector: '.edit-post-header', side: 'bottom', url: '/wp-admin/post-new.php' },
  { category: 'Block Editor', label: 'Writing area', selector: '.block-editor-writing-flow', side: 'top', url: '/wp-admin/post-new.php' },
  { category: 'Block Editor', label: 'Document sidebar', selector: '.interface-complementary-area', side: 'left', url: '/wp-admin/post-new.php' },
  { category: 'Block Editor', label: 'Publish / settings buttons', selector: '.editor-header__settings', side: 'bottom', url: '/wp-admin/post-new.php' },

  // Media
  { category: 'Media', label: 'Media library grid', selector: '.attachments-browser', side: 'top', url: '/wp-admin/upload.php' },
  { category: 'Media', label: 'Media toolbar', selector: '.media-toolbar', side: 'bottom', url: '/wp-admin/upload.php' },

  // Appearance
  { category: 'Appearance', label: 'Themes grid', selector: '.theme-browser', side: 'top', url: '/wp-admin/themes.php' },

  // Settings
  { category: 'Settings', label: 'Settings form', selector: '.wrap form', side: 'top', url: '/wp-admin/options-general.php' },
  { category: 'Settings', label: 'Save Changes button', selector: '.wrap p.submit', side: 'top', url: '/wp-admin/options-general.php' },
];

export interface TourStepTemplate {
  title: string;
  description: string;
  selector: string;
  url?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export interface TourTemplate {
  name: string;
  description: string;
  steps: TourStepTemplate[];
}

export const TOUR_TEMPLATES: TourTemplate[] = [
  {
    name: 'Admin Overview',
    description: 'Introduce the main admin areas — 5 steps',
    steps: [
      {
        title: 'Welcome to Your WordPress Site',
        description: 'This is the WordPress admin — your control centre for managing your website. The left sidebar is your main navigation.',
        selector: '#wpadminbar',
        url: '/wp-admin/',
        side: 'bottom',
      },
      {
        title: 'Dashboard',
        description: 'Your at-a-glance overview of site activity, recent posts, and important updates.',
        selector: '#menu-dashboard',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Pages',
        description: 'Create and manage the static pages of your site — homepage, about, contact, and more.',
        selector: '#menu-pages',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Appearance',
        description: "Customise your site's look and feel. Access themes, menus, and the Site Editor from here.",
        selector: '#menu-appearance',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Plugins',
        description: 'Extend your site with plugins — install from WordPress.org or upload your own ZIP files.',
        selector: '#menu-plugins',
        url: '/wp-admin/',
        side: 'right',
      },
    ],
  },
  {
    name: 'Block Editor',
    description: 'Walk through the Gutenberg editor — 4 steps',
    steps: [
      {
        title: 'The Block Editor',
        description: 'WordPress uses a block-based editor. Every piece of content — text, images, video — is a block you can move and style independently.',
        selector: '.edit-post-layout',
        url: '/wp-admin/post-new.php',
        side: 'top',
      },
      {
        title: 'Post Title',
        description: 'Start by typing a title for your post or page here. A good title is clear and descriptive.',
        selector: '.editor-post-title',
        url: '/wp-admin/post-new.php',
        side: 'bottom',
      },
      {
        title: 'Editor Toolbar',
        description: 'The top toolbar lets you undo changes, switch between editor views, and publish your content.',
        selector: '.edit-post-header',
        url: '/wp-admin/post-new.php',
        side: 'bottom',
      },
      {
        title: 'Document Settings',
        description: 'Use the sidebar to set categories, tags, a featured image, and to schedule or publish your content.',
        selector: '.interface-complementary-area',
        url: '/wp-admin/post-new.php',
        side: 'left',
      },
    ],
  },
  {
    name: 'Content & Media',
    description: 'Cover posts, pages, and the media library — 3 steps',
    steps: [
      {
        title: 'Posts',
        description: 'Posts are time-stamped content — perfect for blog articles, news updates, and announcements.',
        selector: '#menu-posts',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Pages',
        description: "Pages are for static content that doesn't change often — About Us, Contact, Services, and similar.",
        selector: '#menu-pages',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Media Library',
        description: 'All images, videos, documents, and other files you upload are stored here for easy reuse across your site.',
        selector: '#menu-media',
        url: '/wp-admin/',
        side: 'right',
      },
    ],
  },
  {
    name: 'Plugin Management',
    description: 'Explain how to find and manage plugins — 3 steps',
    steps: [
      {
        title: 'Plugins',
        description: 'Plugins extend WordPress with new features — from contact forms to eCommerce. There are over 60,000 free plugins available.',
        selector: '#menu-plugins',
        url: '/wp-admin/',
        side: 'right',
      },
      {
        title: 'Installed Plugins',
        description: 'Here you can see all installed plugins. Activate or deactivate them with a single click, or delete ones you no longer need.',
        selector: '#the-list',
        url: '/wp-admin/plugins.php',
        side: 'top',
      },
      {
        title: 'Settings & Options',
        description: 'After activating a plugin, look in the Settings menu or the sidebar for new options it has added.',
        selector: '#menu-settings',
        url: '/wp-admin/plugins.php',
        side: 'right',
      },
    ],
  },
];
