import { Step, Blueprint, BlueprintStep } from '../types/blueprint';

// Validate that a string doesn't contain raw control characters
export function validateNoControlCharacters(str: string, context: string = 'string'): void {
  const controlCharRegex = /[\x00-\x08\x0B-\x0C\x0E-\x1F]/;
  const matches = str.match(controlCharRegex);

  if (matches) {
    const charCodes = matches.map(c => `0x${c.charCodeAt(0).toString(16)}`).join(', ');
    console.error(`❌ Raw control characters found in ${context}:`, charCodes);
    throw new Error(`Control characters detected in ${context}. Data must be cleaned before encoding. Found: ${charCodes}`);
  }
}

// UTF-8 safe base64 encoding function
export function unicodeSafeBase64Encode(str: string): string {
  // Validate that there are no raw control characters before encoding
  try {
    validateNoControlCharacters(str, 'base64 input');
  } catch (error) {
    // If control characters are detected, log the error but continue
    // The data should have been cleaned by this point, so this is a safety check
    console.error('Control characters detected during base64 encoding:', error);
    console.warn('Attempting to sanitize the input before encoding...');

    // Apply sanitization as a last resort
    str = sanitizeJsonString(str);

    // Validate again after sanitization
    try {
      validateNoControlCharacters(str, 'sanitized base64 input');
    } catch (secondError) {
      console.error('❌ Control characters still present after sanitization');
      throw secondError;
    }
  }

  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return btoa(utf8Bytes);
}

// Sanitize JSON string to ensure all control characters are properly escaped
export function sanitizeJsonString(jsonStr: string): string {
  return jsonStr.replace(/[\x00-\x1F\x7F]/g, (char) => {
    const code = char.charCodeAt(0);
    switch (code) {
      case 0x08: return '\\b';
      case 0x09: return '\\t';
      case 0x0A: return '\\n';
      case 0x0C: return '\\f';
      case 0x0D: return '\\r';
      default: return '\\u' + code.toString(16).padStart(4, '0');
    }
  });
}

// Clean a string to remove control characters
export function cleanString(str: string): string {
  if (typeof str !== 'string') return str;
  // Remove ALL control characters including extended ASCII control chars
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Replace all control chars with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Deep clean object to remove ALL control characters from all string values
export function deepCleanObject(obj: any): any {
  if (typeof obj === 'string') {
    return cleanString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => deepCleanObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = deepCleanObject(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

// Safe JSON stringify that properly handles ALL control characters for WordPress Studio
export function safeJsonStringify(obj: unknown): string {
  // First, deep clean the object to remove control characters from all strings
  const cleanedObj = deepCleanObject(obj);

  // Then stringify with native JSON.stringify
  const jsonStr = JSON.stringify(cleanedObj);

  // Final verification - check for any remaining RAW control characters (not escaped ones)
  // This regex looks for literal control characters, not the escaped versions like \n or \t
  const controlCharMatches = jsonStr.match(/[\x00-\x1F\x7F-\x9F]/g);
  if (controlCharMatches) {
    console.warn('⚠️ Raw control characters detected in JSON:',
      controlCharMatches.map(c => `0x${c.charCodeAt(0).toString(16)}`).join(', '));
    console.warn('Applying final sanitization...');
    return sanitizeJsonString(jsonStr);
  }

  // Validate that the JSON is parseable
  try {
    JSON.parse(jsonStr);
    return jsonStr;
  } catch (e) {
    // If JSON.parse fails, apply sanitization as a fallback
    console.warn('⚠️ JSON validation failed, applying sanitization fallback:', e instanceof Error ? e.message : 'Unknown error');
    const sanitizedJson = sanitizeJsonString(jsonStr);

    // Try to parse the sanitized version
    try {
      JSON.parse(sanitizedJson);
      console.log('✅ Sanitization fallback successful');
      return sanitizedJson;
    } catch (sanitizeError) {
      // If even sanitization doesn't work, throw a detailed error
      console.error('❌ Generated invalid JSON even after sanitization:', sanitizeError instanceof Error ? sanitizeError.message : 'Unknown error');
      throw new Error('Generated invalid JSON even after sanitization: ' + (sanitizeError instanceof Error ? sanitizeError.message : 'Unknown error'));
    }
  }
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
    // Clean strings before using in command
    const cleanTitle = cleanString(data.title);
    const cleanContent = cleanString(data.content || '');

    // Create new homepage
    steps.push({
      step: 'wp-cli',
      command: `wp post create --post_type=page --post_status=publish --post_title="${cleanTitle.replace(/"/g, '\\"')}" --post_content="${cleanContent.replace(/"/g, '\\"')}" --porcelain`
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
      const cleanPageTitle = cleanString(selectedStep.data.postTitle);
      const pageTitle = cleanPageTitle.replace(/"/g, '\\"');
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

  // Clean menu name
  const cleanMenuName = cleanString(data.menuName);

  // Step 1: Create the menu
  steps.push({
    step: 'wp-cli',
    command: `wp menu create "${cleanMenuName.replace(/"/g, '\\"')}"`
  });

  // Step 2: Add menu items using simple commands
  data.menuItems.forEach((item: any) => {
    if (item.type === 'page' && item.pageStepId) {
      const selectedStep = allSteps.find(s => s.id === item.pageStepId);
      if (selectedStep && selectedStep.data.postTitle) {
        // Use a single wp eval to find page and add to menu
        const cleanPageTitle = cleanString(selectedStep.data.postTitle);
        const pageTitle = cleanPageTitle.replace(/"/g, '\\"');
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$page = get_page_by_title("${pageTitle}", OBJECT, "page"); if ($page) { $menu = get_term_by("name", "${cleanMenuName.replace(/"/g, '\\"')}", "nav_menu"); if ($menu) { wp_update_nav_menu_item($menu->term_id, 0, array("menu-item-title" => $page->post_title, "menu-item-object" => "page", "menu-item-object-id" => $page->ID, "menu-item-type" => "post_type", "menu-item-status" => "publish")); echo "Added page to menu"; } }'`
        });
      }
    } else if (item.type === 'custom' && item.title && item.url) {
      // Add custom link using wp eval
      const cleanLinkTitle = cleanString(item.title);
      const cleanLinkUrl = cleanString(item.url);
      const linkTitle = cleanLinkTitle.replace(/"/g, '\\"');
      const linkUrl = cleanLinkUrl.replace(/"/g, '\\"');
      steps.push({
        step: 'wp-cli',
        command: `wp eval '$menu = get_term_by("name", "${cleanMenuName.replace(/"/g, '\\"')}", "nav_menu"); if ($menu) { wp_update_nav_menu_item($menu->term_id, 0, array("menu-item-title" => "${linkTitle}", "menu-item-url" => "${linkUrl}", "menu-item-type" => "custom", "menu-item-status" => "publish")); echo "Added custom link to menu"; }'`
      });
    }
  });

  // Step 3: Assign menu to location
  if (data.menuLocation) {
    const cleanMenuLocation = cleanString(data.menuLocation);
    steps.push({
      step: 'wp-cli',
      command: `wp eval '$menu = get_term_by("name", "${cleanMenuName.replace(/"/g, '\\"')}", "nav_menu"); if ($menu) { $locations = get_theme_mod("nav_menu_locations", array()); $locations["${cleanMenuLocation.replace(/"/g, '\\"')}"] = $menu->term_id; set_theme_mod("nav_menu_locations", $locations); echo "Menu assigned"; }'`
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
    // Clean strings before using in command
    const cleanTitle = cleanString(data.title);
    const cleanContent = cleanString(data.content || '');

    // Create new posts page
    steps.push({
      step: 'wp-cli',
      command: `wp post create --post_type=page --post_status=publish --post_title="${cleanTitle.replace(/"/g, '\\"')}" --post_content="${cleanContent.replace(/"/g, '\\"')}" --porcelain`
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
      const cleanPageTitle = cleanString(selectedStep.data.postTitle);
      const pageTitle = cleanPageTitle.replace(/"/g, '\\"');
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
export function validateBlueprintStep(step: BlueprintStep): boolean {
  switch (step.step) {
    case 'installPlugin':
      return step.pluginData && (step.pluginData.url || step.pluginData.slug);
    case 'installTheme':
      return step.themeData && (step.themeData.url || step.themeData.slug);
    case 'wp-cli':
      return step.command && step.command.trim();
    case 'addMedia':
      return step.command && step.command.includes('wp media import');
    case 'setSiteOptions':
      return step.options && Object.keys(step.options).length > 0;
    case 'defineWpConfigConst':
      return step.consts && Object.keys(step.consts).length > 0;
    case 'importWxr':
      return step.file && step.file.url;
    case 'login':
      return step.username;
    case 'addClientRole':
      return step.name && step.capabilities && step.capabilities.length > 0;
    default:
      return true;
  }
}

export function generateBlueprint(allSteps: Step[], title: string, landingPageType: 'wp-admin' | 'front-page' | 'custom' = 'wp-admin', customUrl?: string): Blueprint {
  // Check if there's a setLandingPage step to override the default
  const landingPageStep = allSteps.find(step => step.type === 'setLandingPage');
  const finalLandingPageType = landingPageStep?.data?.landingPageType || landingPageType;
  const finalCustomUrl = landingPageStep?.data?.customUrl || customUrl;

  let landingPageUrl = '/wp-admin/';
  if (finalLandingPageType === 'front-page') {
    landingPageUrl = '/';
  } else if (finalLandingPageType === 'custom' && finalCustomUrl) {
    landingPageUrl = finalCustomUrl;
  }

  const blueprint: Blueprint = {
    landingPage: landingPageUrl,
    preferredVersions: {
      wp: 'latest',
      php: '8.2'
    },
    phpExtensionBundles: ['kitchen-sink'],
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
    const cleanTitle = cleanString(title);
    blueprint.steps.push({
      step: 'setSiteOptions',
      options: {
        blogname: cleanTitle
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

      // Clean and escape title for wp-cli command
      const cleanTitle = cleanString(data.postTitle || '');
      const escapedTitle = cleanTitle.replace(/"/g, '\\"');

      // Clean content first to remove control characters
      const content = cleanString(data.postContent || '');
      const hasGutenbergBlocks = content.includes('<!-- wp:');

      if (hasGutenbergBlocks) {
        // Use wp eval for Gutenberg content to preserve block structure
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$content = base64_decode("${unicodeSafeBase64Encode(content)}"); $post_data = array("post_title" => "${escapedTitle}", "post_content" => $content, "post_status" => "${data.postStatus || 'publish'}", "post_type" => "${data.postType || 'post'}"); $post_id = wp_insert_post($post_data); if (is_wp_error($post_id)) { echo "Error: " . $post_id->get_error_message(); } else { echo "Created post ID: " . $post_id; }'`
        });
      } else {
        // Use regular wp-cli for simple content - escape properly
        const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, ' ');
        steps.push({
          step: 'wp-cli',
          command: `wp post create --post_type=${data.postType || 'post'} --post_status=${data.postStatus || 'publish'} --post_title="${escapedTitle}" --post_content="${escapedContent}" --porcelain`
        });
      }
      
      // If featured image URL is provided, import it and set as featured image
      if (data.featuredImageUrl && data.featuredImageUrl.trim()) {
        const cleanImageUrl = cleanString(data.featuredImageUrl);
        const cleanImageTitle = cleanString(`${data.postTitle} Featured Image`);

        // Import the media file and get its ID
        steps.push({
          step: 'wp-cli',
          command: `wp media import "${cleanImageUrl.replace(/"/g, '\\"')}" --title="${cleanImageTitle.replace(/"/g, '\\"')}" --porcelain`
        });

        // Set the featured image using a more reliable PHP approach
        steps.push({
          step: 'wp-cli',
          command: `wp eval '$post = get_page_by_title("${cleanTitle.replace(/"/g, '\\"')}", OBJECT, "${data.postType || 'post'}"); if ($post) { $attachments = get_posts(array("post_type" => "attachment", "posts_per_page" => 1, "orderby" => "date", "order" => "DESC")); if (!empty($attachments)) { $result = set_post_thumbnail($post->ID, $attachments[0]->ID); echo $result ? "Featured image set for post " . $post->ID : "Failed to set featured image"; } else { echo "No attachments found"; } } else { echo "Post not found: ${cleanTitle.replace(/"/g, '\\"')}"; }'`
        });
      }
      
      return steps.length === 1 ? steps[0] : steps;
    }

    case 'addPage':
      if (!data.postTitle) return null;

      // Clean all string inputs first
      const pageContent = cleanString(data.postContent || '');
      const cleanPageTitle = cleanString(data.postTitle || '');
      const cleanPostName = data.postName ? cleanString(data.postName) : '';
      const cleanTemplate = data.template ? cleanString(data.template.trim()) : '';

      // Build post data array
      const postDataParts = [
        `"post_title" => "${cleanPageTitle.replace(/"/g, '\\"')}"`,
        `"post_content" => $content`,
        `"post_status" => "${data.postStatus || 'publish'}"`,
        `"post_type" => "page"`
      ];

      // Add optional fields
      if (cleanPostName) {
        postDataParts.push(`"post_name" => "${cleanPostName.replace(/"/g, '\\"')}"`);
      }
      if (data.postParent) {
        postDataParts.push(`"post_parent" => ${data.postParent}`);
      }
      if (data.menuOrder) {
        postDataParts.push(`"menu_order" => ${data.menuOrder}`);
      }

      // Build meta input array for page template
      const metaInputParts = [];
      if (cleanTemplate) {
        metaInputParts.push(`"_wp_page_template" => "${cleanTemplate.replace(/"/g, '\\"')}"`);
      }

      const metaInputParam = metaInputParts.length > 0
        ? `, "meta_input" => array(${metaInputParts.join(', ')})`
        : '';

      return {
        step: 'wp-cli',
        command: `wp eval '$content = base64_decode("${unicodeSafeBase64Encode(pageContent)}"); $post_data = array(${postDataParts.join(', ')}${metaInputParam}); $post_id = wp_insert_post($post_data); if (is_wp_error($post_id)) { echo "Error: " . $post_id->get_error_message(); } else { echo "Created page ID: " . $post_id; }'`
      };

    case 'addMedia':
      if (!data.downloadUrl) return null;

      // Clean and escape URL for wp-cli command
      const cleanUrl = cleanString(data.downloadUrl);
      const escapedUrl = cleanUrl.replace(/"/g, '\\"');
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
        step: 'defineWpConfigConsts',
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
      const cleanRoleName = cleanString(data.name);
      const capsString = data.capabilities.join(',');
      return {
        step: 'wp-cli',
        command: `wp role create ${cleanRoleName} "${cleanRoleName}" --grant=${capsString}`
      };

    case 'setLandingPage':
      // This step doesn't generate a blueprint step, it just affects the landingPage URL
      // The URL is handled in generateBlueprint function
      return null;

    default:
      return null;
  }
}