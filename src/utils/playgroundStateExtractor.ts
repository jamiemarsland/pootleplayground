import { Step } from '../types/blueprint';

export interface PlaygroundState {
  active_theme: string;
  theme_name: string;
  active_plugins: string[];
  site_options: {
    blogname: string;
    blogdescription: string;
    permalink_structure: string;
  };
  pages: Array<{
    title: string;
    slug: string;
    content: string;
    menu_order: number;
  }>;
  posts: Array<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
  }>;
  menus: Array<{
    name: string;
    items: Array<{ title: string; url: string; type: string }>;
  }>;
  homepage: {
    show_on_front: string;
    page_on_front_id: number;
    page_for_posts_id: number;
    page_on_front_title?: string;
    page_for_posts_title?: string;
  };
}

export const EXTRACTION_PHP_SCRIPT = `<?php
require('/wordpress/wp-load.php');

$data = [];

$theme = wp_get_theme();
$data['active_theme'] = $theme->get_stylesheet();
$data['theme_name'] = $theme->get('Name');

$active_plugins = get_option('active_plugins', []);
$data['active_plugins'] = array_values(array_filter($active_plugins, function($p) {
    $slug = explode('/', $p)[0];
    return !in_array($slug, ['hello', 'hello-dolly', 'akismet']);
}));

$data['site_options'] = [
    'blogname' => get_option('blogname', ''),
    'blogdescription' => get_option('blogdescription', ''),
    'permalink_structure' => get_option('permalink_structure', ''),
];

$pages = get_pages(['post_status' => 'publish']) ?: [];
$data['pages'] = array_map(function($page) {
    return [
        'title' => $page->post_title,
        'slug' => $page->post_name,
        'content' => $page->post_content,
        'menu_order' => (int)$page->menu_order,
    ];
}, $pages);

$posts = get_posts([
    'post_status' => 'publish',
    'numberposts' => 15,
    'post_type' => 'post',
]) ?: [];
$data['posts'] = array_map(function($post) {
    return [
        'title' => $post->post_title,
        'slug' => $post->post_name,
        'content' => $post->post_content,
        'excerpt' => $post->post_excerpt,
    ];
}, $posts);

$menus = wp_get_nav_menus() ?: [];
$data['menus'] = [];
foreach ($menus as $menu) {
    $items = wp_get_nav_menu_items($menu->term_id) ?: [];
    $menu_data = ['name' => $menu->name, 'items' => []];
    foreach ($items as $item) {
        $menu_data['items'][] = [
            'title' => $item->title,
            'url' => $item->url,
            'type' => $item->type,
        ];
    }
    $data['menus'][] = $menu_data;
}

$data['homepage'] = [
    'show_on_front' => get_option('show_on_front', 'posts'),
    'page_on_front_id' => (int)get_option('page_on_front', 0),
    'page_for_posts_id' => (int)get_option('page_for_posts', 0),
];

if ($data['homepage']['page_on_front_id']) {
    $fp = get_post($data['homepage']['page_on_front_id']);
    $data['homepage']['page_on_front_title'] = $fp ? $fp->post_title : '';
}
if ($data['homepage']['page_for_posts_id']) {
    $pp = get_post($data['homepage']['page_for_posts_id']);
    $data['homepage']['page_for_posts_title'] = $pp ? $pp->post_title : '';
}

echo json_encode($data);
`;

const DEFAULT_THEMES = new Set([
  'twentytwentyone', 'twentytwentytwo', 'twentytwentythree',
  'twentytwentyfour', 'twentytwentyfive', 'twentyseventeen',
  'twentynineteen', 'twentytwenty'
]);

function extractPluginSlug(pluginPath: string): string {
  return pluginPath.split('/')[0];
}

export function convertPlaygroundStateToSteps(state: PlaygroundState): Step[] {
  const steps: Step[] = [];
  const timestamp = Date.now();

  if (state.site_options.blogname && state.site_options.blogname !== 'My WordPress Site') {
    steps.push({
      id: `setSiteOption-blogname-${timestamp}`,
      type: 'setSiteOption',
      data: { option: 'blogname', value: state.site_options.blogname }
    });
  }

  if (state.site_options.blogdescription) {
    steps.push({
      id: `setSiteOption-blogdescription-${timestamp + 1}`,
      type: 'setSiteOption',
      data: { option: 'blogdescription', value: state.site_options.blogdescription }
    });
  }

  if (state.site_options.permalink_structure && state.site_options.permalink_structure !== '') {
    steps.push({
      id: `setSiteOption-permalinks-${timestamp + 2}`,
      type: 'setSiteOption',
      data: { option: 'permalink_structure', value: state.site_options.permalink_structure }
    });
  }

  if (state.active_theme && !DEFAULT_THEMES.has(state.active_theme)) {
    steps.push({
      id: `installTheme-${timestamp}`,
      type: 'installTheme',
      data: {
        themeZipFile: {
          resource: 'wordpress.org/themes',
          slug: state.active_theme
        },
        options: { activate: true }
      }
    });
  } else if (state.active_theme) {
    steps.push({
      id: `installTheme-${timestamp}`,
      type: 'installTheme',
      data: {
        themeZipFile: {
          resource: 'wordpress.org/themes',
          slug: state.active_theme
        },
        options: { activate: true }
      }
    });
  }

  state.active_plugins.forEach((pluginPath, i) => {
    const slug = extractPluginSlug(pluginPath);
    steps.push({
      id: `installPlugin-${slug}-${timestamp + i}`,
      type: 'installPlugin',
      data: {
        pluginZipFile: {
          resource: 'wordpress.org/plugins',
          slug
        },
        options: { activate: true }
      }
    });
  });

  state.pages.forEach((page, i) => {
    steps.push({
      id: `addPage-${i}-${timestamp}`,
      type: 'addPage',
      data: {
        postTitle: page.title,
        postContent: page.content,
        postStatus: 'publish',
        postName: page.slug,
        menuOrder: page.menu_order > 0 ? String(page.menu_order) : '',
        postParent: '',
        template: ''
      }
    });
  });

  state.posts.forEach((post, i) => {
    steps.push({
      id: `addPost-${i}-${timestamp}`,
      type: 'addPost',
      data: {
        postTitle: post.title,
        postContent: post.content,
        postType: 'post',
        postStatus: 'publish',
        postDate: 'now',
        featuredImageUrl: ''
      }
    });
  });

  state.menus.forEach((menu, i) => {
    if (menu.items.length > 0) {
      steps.push({
        id: `createNavigationMenu-${i}-${timestamp}`,
        type: 'createNavigationMenu',
        data: {
          menuName: menu.name,
          menuLocation: 'primary',
          menuItems: menu.items.map(item => ({
            label: item.title,
            url: item.url
          }))
        }
      });
    }
  });

  if (state.homepage.show_on_front === 'page' && state.homepage.page_on_front_title) {
    steps.push({
      id: `setHomepage-${timestamp}`,
      type: 'setHomepage',
      data: {
        option: 'existing',
        title: state.homepage.page_on_front_title
      }
    });
  }

  if (state.homepage.page_for_posts_title) {
    steps.push({
      id: `setPostsPage-${timestamp}`,
      type: 'setPostsPage',
      data: {
        option: 'existing',
        title: state.homepage.page_for_posts_title
      }
    });
  }

  return steps;
}

export function getSiteTitleFromState(state: PlaygroundState): string {
  return state.site_options.blogname || 'My WordPress Site';
}
