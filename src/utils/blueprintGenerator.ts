import { Step, Blueprint, BlueprintStep } from '../types/blueprint';

// UTF-8 safe base64 encoding function
function unicodeSafeBase64Encode(str: string): string {
  // First encode the string to UTF-8 bytes using encodeURIComponent and escape
  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return btoa(utf8Bytes);
}

// Helper function to calculate estimated page ID based on step position
function getEstimatedPageId(stepId: string, allSteps: Step[]): number {
  const stepIndex = allSteps.findIndex(s => s.id === stepId);
  let pageId = 2; // WordPress starts IDs at 2 for posts/pages
  
  // Count existing posts/pages that would have been created before this step
  for (let i = 0; i < stepIndex; i++) {
    const prevStep = allSteps[i];
    if (prevStep.type === 'addPost' || prevStep.type === 'addPage') {
      pageId++;
    }
  }
  
  return pageId;
}

// Handle homepage step configuration
function handleHomepageStep(step: Step, allSteps: Step[]): BlueprintStep | BlueprintStep[] | null {
  const { data } = step;
  const steps: BlueprintStep[] = [];
  
  let homepageId = 0;
  
  if (data.option === 'create' && data.title) {
    // Create new homepage
    steps.push({
      step: 'wp-cli',
      command: `wp post create --post_type=page --post_status=publish --post_title="${data.title}" --post_content="${data.content || ''}" --porcelain`
    });
    
    // Calculate the ID this page will have
    const stepIndex = allSteps.findIndex(s => s.id === step.id);
    let nextId = 2;
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = allSteps[i];
      if (prevStep.type === 'addPost' || prevStep.type === 'addPage') {
        nextId++;
      }
    }
    homepageId = nextId;
  } else if (data.option === 'existing' && data.stepId) {
    // Use existing page - find it by title using wp-cli
    const selectedStep = allSteps.find(s => s.id === data.stepId);
    if (selectedStep && selectedStep.data.postTitle) {
      const pageTitle = selectedStep.data.postTitle.replace(/"/g, '\\"');
      steps.push({
        step: 'wp-cli', 
        command: `wp eval '$page = get_page_by_title("${pageTitle}", OBJECT, "page"); if ($page) { update_option("show_on_front", "page"); update_option("page_on_front", $page->ID); echo "Homepage set to page ID: " . $page->ID; } else { echo "Page not found: ${pageTitle}"; }'`
      });
      return steps.length > 0 ? steps : null;
    }
  }
  
  if (homepageId > 0) {
    steps.push({
      step: 'setSiteOptions',
      options: {
        show_on_front: 'page',
        page_on_front: homepageId
      }
    });
  }
  
  return steps.length > 0 ? steps : null;
}

// Handle navigation menu step configuration
function handleNavigationMenuStep(step: Step, allSteps: Step[]): BlueprintStep[] | null {
  const { data } = step;
  const steps: BlueprintStep[] = [];
  
  if (!data.menuName || !data.menuItems || data.menuItems.length === 0) {
    return null;
  }
  // Step 1: Create the menu
  steps.push({
    step: 'wp-cli',
    command: `wp menu create "${data.menuName}"`
  });

  // Step 2: Add menu items using simple commands
  data.menuItems.forEach((item: any) => {
    if (item.type === 'page' && item.pageStepId) {
      const selectedStep = allSteps.find(s => s.id === item.pageStepId);
      if (selectedStep && selectedStep.data.postTitle) {
        // Use a single wp eval to find page and add to menu
        const pageTitle = selectedStep.data.postTitle.replace(/"/g, '\\"');
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$page = get_page_by_title("${pageTitle}", OBJECT, "page"); if ($page) { $menu = get_term_by("name", "${data.menuName}", "nav_menu"); if ($menu) { wp_update_nav_menu_item($menu->term_id, 0, array("menu-item-title" => $page->post_title, "menu-item-object" => "page", "menu-item-object-id" => $page->ID, "menu-item-type" => "post_type", "menu-item-status" => "publish")); echo "Added page to menu"; } }'`
        });
      }
    } else if (item.type === 'custom' && item.title && item.url) {
      // Add custom link using wp eval
      const linkTitle = item.title.replace(/"/g, '\\"');
      const linkUrl = item.url.replace(/"/g, '\\"');
      steps.push({
        step: 'wp-cli',
        command: `wp eval '$menu = get_term_by("name", "${data.menuName}", "nav_menu"); if ($menu) { wp_update_nav_menu_item($menu->term_id, 0, array("menu-item-title" => "${linkTitle}", "menu-item-url" => "${linkUrl}", "menu-item-type" => "custom", "menu-item-status" => "publish")); echo "Added custom link to menu"; }'`
      });
    }
  });

  // Step 3: Assign menu to location
  if (data.menuLocation) {
    steps.push({
      step: 'wp-cli',
      command: `wp eval '$menu = get_term_by("name", "${data.menuName}", "nav_menu"); if ($menu) { $locations = get_theme_mod("nav_menu_locations", array()); $locations["${data.menuLocation}"] = $menu->term_id; set_theme_mod("nav_menu_locations", $locations); echo "Menu assigned"; }'`
    });
  }

  return steps;
}

// Handle posts page step configuration
function handlePostsPageStep(step: Step, allSteps: Step[]): BlueprintStep | BlueprintStep[] | null {
  const { data } = step;
  const steps: BlueprintStep[] = [];
  
  let postsPageId = 0;
  
  if (data.option === 'create' && data.title) {
    // Create new posts page
    steps.push({
      step: 'wp-cli',
      command: `wp post create --post_type=page --post_status=publish --post_title="${data.title}" --post_content="${data.content || ''}" --porcelain`
    });
    
    // Calculate the ID this page will have
    const stepIndex = allSteps.findIndex(s => s.id === step.id);
    let nextId = 2;
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = allSteps[i];
      if (prevStep.type === 'addPost' || prevStep.type === 'addPage') {
        nextId++;
      }
    }
    postsPageId = nextId;
  } else if (data.option === 'existing' && data.stepId) {
    // Use existing page - find it by title using wp-cli
    const selectedStep = allSteps.find(s => s.id === data.stepId);
    if (selectedStep && selectedStep.data.postTitle) {
      const pageTitle = selectedStep.data.postTitle.replace(/"/g, '\\"');
      steps.push({
        step: 'wp-cli',
        command: `wp eval '$page = get_page_by_title("${pageTitle}", OBJECT, "page"); if ($page) { update_option("page_for_posts", $page->ID); echo "Posts page set to page ID: " . $page->ID; } else { echo "Page not found: ${pageTitle}"; }'`
      });
      return steps.length > 0 ? steps : null;
    }
  }
  
  if (postsPageId > 0) {
    steps.push({
      step: 'setSiteOptions',
      options: {
        page_for_posts: postsPageId
      }
    });
  }
  
  return steps.length > 0 ? steps : null;
}
export function generateBlueprint(allSteps: Step[], title: string, landingPageType: 'wp-admin' | 'front-page' = 'wp-admin'): Blueprint {
  // Check if there's a setLandingPage step to override the default
  const landingPageStep = allSteps.find(step => step.type === 'setLandingPage');
  const finalLandingPageType = landingPageStep?.data?.landingPageType || landingPageType;
  const landingPageUrl = finalLandingPageType === 'wp-admin' ? '/wp-admin/' : '/';
  
  const blueprint: Blueprint = {
    landingPage: landingPageUrl,
    preferredVersions: {
      php: '8.2',
      wp: 'latest'
    },
    phpExtensionBundles: ["kitchen-sink"],
    steps: []
  };
  
  // Convert steps to blueprint format
  const convertedSteps: BlueprintStep[] = [];
  
  allSteps.forEach(step => {
    const result = convertStepToBlueprint(step, allSteps);
    if (result) {
      if (Array.isArray(result)) {
        convertedSteps.push(...result);
      } else {
        convertedSteps.push(result);
      }
    }
  });
  
  // Add site title as the first step if title is provided
  if (title && title !== 'My WordPress Site') {
    blueprint.steps.push({
      step: 'setSiteOptions',
      options: {
        blogname: title
      }
    });
  }

  // Login with default admin user
  blueprint.steps.push({
    step: 'login',
    username: 'admin',
    password: 'password'
  });

  blueprint.steps = blueprint.steps.concat(convertedSteps);

  return blueprint;
}

function convertStepToBlueprint(step: Step, allSteps: Step[]): BlueprintStep | BlueprintStep[] | null {
  const { type, data } = step;

  switch (type) {
    case 'setHomepage':
      return handleHomepageStep(step, allSteps);
      
    case 'setPostsPage':
      return handlePostsPageStep(step, allSteps);

    case 'createNavigationMenu':
      return handleNavigationMenuStep(step, allSteps);

    case 'installPlugin': {
      const steps: BlueprintStep[] = [];
      
      console.log('Converting plugin step:', data);
      if (!data.pluginZipFile) return null;
      
      const pluginSource = data.pluginZipFile.resource;
      
      if (pluginSource === 'wordpress.org/plugins') {
        const slug = data.pluginZipFile?.['wordpress.org/plugins'] || '';
        if (!slug) return null;
        
        // For WordPress.org plugins, use the direct download URL
        return {
          step: 'installPlugin',
          pluginData: {
            resource: 'wordpress.org/plugins',
            slug: slug
          },
          options: {
            activate: data.options?.activate !== false
          }
        };
      } else {
        const pluginUrl = data.pluginZipFile?.url || '';
        if (!pluginUrl || !pluginUrl.trim()) {
          return null;
        }
        
        return {
          step: 'installPlugin',
          pluginData: {
            resource: 'url',
            url: pluginUrl
          },
          options: {
            activate: data.options?.activate !== false
          }
        };
      }
    }

    case 'installTheme':
      console.log('Converting theme step:', data);
      if (!data.themeZipFile) return null;
      
      const themeSource = data.themeZipFile.resource;
      
      if (themeSource === 'wordpress.org/themes') {
        const slug = data.themeZipFile?.['wordpress.org/themes'] || '';
        if (!slug) return null;
        
        return {
          step: 'installTheme',
          themeData: {
            resource: 'wordpress.org/themes', 
            slug: slug
          },
          options: data.options || { activate: true }
        };
      } else {
        const themeUrl = data.themeZipFile?.url || '';
        if (!themeUrl || !themeUrl.trim()) {
          return null;
        }
        
        return {
          step: 'installTheme',
          themeData: {
            resource: 'url',
            url: themeUrl
          },
          options: data.options || { activate: true }
        };
      }

    case 'addPost': {
      if (!data.postTitle) return null;
      
      const steps: BlueprintStep[] = [];
      
      // Escape title for wp-cli command
      const escapedTitle = (data.postTitle || '').replace(/"/g, '\\"');
      
      // For Gutenberg blocks, use a different approach to preserve structure
      const content = data.postContent || '';
      const hasGutenbergBlocks = content.includes('<!-- wp:');
      
      if (hasGutenbergBlocks) {
        // Use wp eval for Gutenberg content to preserve block structure
        const jsContent = content.replace(/'/g, "\\'").replace(/\n/g, '\\n');
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$content = base64_decode("${unicodeSafeBase64Encode(content)}"); $post_data = array("post_title" => "${escapedTitle}", "post_content" => $content, "post_status" => "${data.postStatus || 'publish'}", "post_type" => "${data.postType || 'post'}"); $post_id = wp_insert_post($post_data); if (is_wp_error($post_id)) { echo "Error: " . $post_id->get_error_message(); } else { echo "Created post ID: " . $post_id; }'`
        });
      } else {
        // Use regular wp-cli for simple content
        const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        steps.push({
          step: 'wp-cli',
          command: `wp post create --post_type=${data.postType || 'post'} --post_status=${data.postStatus || 'publish'} --post_title="${escapedTitle}" --post_content="${escapedContent}" --porcelain`
        });
      }
      
      // If featured image URL is provided, import it and set as featured image
      if (data.featuredImageUrl && data.featuredImageUrl.trim()) {
        // Import the media file and get its ID
        steps.push({
          step: 'wp-cli',
          command: `wp media import "${data.featuredImageUrl}" --title="${data.postTitle} Featured Image" --porcelain`
        });
        
        // Set the featured image using a more reliable PHP approach
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$post = get_page_by_title("${data.postTitle}", OBJECT, "${data.postType || 'post'}"); if ($post) { $attachments = get_posts(array("post_type" => "attachment", "posts_per_page" => 1, "orderby" => "date", "order" => "DESC")); if (!empty($attachments)) { $result = set_post_thumbnail($post->ID, $attachments[0]->ID); echo $result ? "Featured image set for post " . $post->ID : "Failed to set featured image"; } else { echo "No attachments found"; } } else { echo "Post not found: ${data.postTitle}"; }'`
        });
      }
      
      return steps.length === 1 ? steps[0] : steps;
    }

    case 'addPage':
      if (!data.postTitle) return null;
      
      // Escape title for wp-cli command
      const escapedPageTitle = (data.postTitle || '').replace(/"/g, '\\"');
      const pageContent = data.postContent || '';
      const pageHasGutenbergBlocks = pageContent.includes('<!-- wp:');
      
      if (pageHasGutenbergBlocks) {
        // Use wp eval for Gutenberg content to preserve block structure
        const jsPageContent = pageContent.replace(/'/g, "\\'").replace(/\n/g, '\\n');
        const postNameParam = data.postName ? `, "post_name" => "${data.postName.replace(/"/g, '\\"')}"` : '';
        const postParentParam = data.postParent ? `, "post_parent" => ${data.postParent}` : '';
        
        return {
          step: 'wp-cli',
          command: `wp eval '$content = base64_decode("${unicodeSafeBase64Encode(pageContent)}"); $post_data = array("post_title" => "${escapedPageTitle}", "post_content" => $content, "post_status" => "${data.postStatus || 'publish'}", "post_type" => "page"${postNameParam}${postParentParam}); $post_id = wp_insert_post($post_data); if (is_wp_error($post_id)) { echo "Error: " . $post_id->get_error_message(); } else { echo "Created page ID: " . $post_id; }'`
        };
      } else {
        // Use regular wp-cli for simple content
        const escapedPageContent = pageContent.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return {
          step: 'wp-cli',
          command: `wp post create --post_type=page --post_status=${data.postStatus || 'publish'} --post_title="${escapedPageTitle}" --post_content="${escapedPageContent}"${data.postName ? ` --post_name="${data.postName.replace(/"/g, '\\"')}"` : ''}${data.postParent ? ` --post_parent=${data.postParent}` : ''}`
        };
      }

    case 'addMedia':
      if (!data.downloadUrl) return null;
      
      // Use wp-cli to import media files
      const escapedUrl = data.downloadUrl.replace(/"/g, '\\"');
      const command = `wp media import "${escapedUrl}"`;
      
      return {
        step: 'wp-cli',
        command: command
      };

    case 'setSiteOption':
      if (!data.option) return null;
      return {
        step: 'setSiteOptions',
        options: {
          [data.option]: data.value
        }
      };

    case 'defineWpConfigConst':
      if (!data.consts || Object.keys(data.consts).length === 0) return null;
      return {
        step: 'defineWpConfigConst',
        consts: data.consts
      };

    case 'login':
      return {
        step: 'login',
        username: data.username || 'admin',
        password: data.password || 'password'
      };

    case 'importWxr':
      if (!data.file?.url) return null;
      return {
        step: 'importWxr',
        file: data.file
      };

    case 'addClientRole':
      if (!data.name || !data.capabilities?.length) return null;
      return {
        step: 'addClientRole',
        name: data.name,
        capabilities: data.capabilities
      };

    case 'setLandingPage':
      // This step doesn't generate a blueprint step, it just affects the landingPage URL
      // The URL is handled in generateBlueprint function
      return null;

    default:
      return null;
  }
}