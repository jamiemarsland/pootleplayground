import { Step, Blueprint, StepType } from '../types/blueprint';

// Convert a native WordPress Playground blueprint to Pootle Playground steps
export function convertNativeBlueprintToPootleSteps(nativeBlueprint: Blueprint): Step[] {
  const pootleSteps: Step[] = [];
  let stepCounter = 1;

  for (const nativeStep of nativeBlueprint.steps) {
    const convertedStep = convertNativeStepToPootleStep(nativeStep, stepCounter);
    if (convertedStep) {
      if (Array.isArray(convertedStep)) {
        pootleSteps.push(...convertedStep);
        stepCounter += convertedStep.length;
      } else {
        pootleSteps.push(convertedStep);
        stepCounter++;
      }
    }
  }

  return pootleSteps;
}

function convertNativeStepToPootleStep(nativeStep: any, stepCounter: number): Step | Step[] | null {
  const stepId = `imported-step-${stepCounter}-${Date.now()}`;

  switch (nativeStep.step) {
    case 'installPlugin':
      return {
        id: stepId,
        type: 'installPlugin',
        data: {
          pluginZipFile: nativeStep.pluginData || { resource: 'url', url: '' },
          options: nativeStep.options || { activate: true }
        }
      };

    case 'installTheme':
      return {
        id: stepId,
        type: 'installTheme',
        data: {
          themeZipFile: nativeStep.themeData || { resource: 'url', url: '' },
          options: nativeStep.options || { activate: true }
        }
      };

    case 'setSiteOptions':
      // Convert setSiteOptions to multiple setSiteOption steps
      if (nativeStep.options && typeof nativeStep.options === 'object') {
        const steps: Step[] = [];
        Object.entries(nativeStep.options).forEach(([option, value], index) => {
          steps.push({
            id: `${stepId}-${index}`,
            type: 'setSiteOption',
            data: {
              option,
              value
            }
          });
        });
        return steps;
      }
      return null;

    case 'defineWpConfigConst':
      return {
        id: stepId,
        type: 'defineWpConfigConst',
        data: {
          consts: nativeStep.consts || {}
        }
      };

    case 'login':
      return {
        id: stepId,
        type: 'login',
        data: {
          username: nativeStep.username || 'admin',
          password: nativeStep.password || 'password'
        }
      };

    case 'importWxr':
      return {
        id: stepId,
        type: 'importWxr',
        data: {
          file: nativeStep.file || { resource: 'url', url: '' }
        }
      };

    case 'wp-cli':
      // Parse wp-cli commands and convert to structured steps
      return parseWpCliCommand(nativeStep.command, stepId);

    default:
      // Skip unknown step types
      console.warn(`Unknown step type "${nativeStep.step}" skipped during import`);
      return null;
  }
}

function parseWpCliCommand(command: string, stepId: string): Step | Step[] | null {
  if (!command || typeof command !== 'string') {
    return null;
  }

  const cmd = command.trim();

  // Parse wp post create commands
  if (cmd.startsWith('wp post create')) {
    const postData = parseWpPostCreateCommand(cmd);
    if (postData) {
      const stepType: StepType = postData.postType === 'page' ? 'addPage' : 'addPost';
      return {
        id: stepId,
        type: stepType,
        data: postData
      };
    }
  }

  // Parse wp media import commands
  if (cmd.startsWith('wp media import')) {
    const mediaData = parseWpMediaImportCommand(cmd);
    if (mediaData) {
      return {
        id: stepId,
        type: 'addMedia',
        data: mediaData
      };
    }
  }

  // Parse wp menu commands (simplified - this is complex in reality)
  if (cmd.startsWith('wp menu create')) {
    const menuData = parseWpMenuCreateCommand(cmd);
    if (menuData) {
      return {
        id: stepId,
        type: 'createNavigationMenu',
        data: menuData
      };
    }
  }

  // For unrecognized wp-cli commands, we could either:
  // 1. Skip them (current approach)
  // 2. Create a generic "Custom WP-CLI" step type
  console.warn(`Unrecognized wp-cli command skipped: ${cmd}`);
  return null;
}

function parseWpPostCreateCommand(command: string): any | null {
  try {
    const postData: any = {
      postTitle: '',
      postContent: '',
      postType: 'post',
      postStatus: 'publish'
    };

    // Extract --post_title
    const titleMatch = command.match(/--post_title="([^"]*?)"/);
    if (titleMatch) {
      postData.postTitle = titleMatch[1];
    }

    // Extract --post_content
    const contentMatch = command.match(/--post_content="([^"]*?)"/);
    if (contentMatch) {
      postData.postContent = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    // Extract --post_type
    const typeMatch = command.match(/--post_type=(\w+)/);
    if (typeMatch) {
      postData.postType = typeMatch[1];
    }

    // Extract --post_status
    const statusMatch = command.match(/--post_status=(\w+)/);
    if (statusMatch) {
      postData.postStatus = statusMatch[1];
    }

    // Extract --post_name (slug)
    const nameMatch = command.match(/--post_name="([^"]*?)"/);
    if (nameMatch) {
      postData.postName = nameMatch[1];
    }

    // Extract --menu_order
    const orderMatch = command.match(/--menu_order=(\d+)/);
    if (orderMatch) {
      postData.menuOrder = parseInt(orderMatch[1]);
    }

    return postData.postTitle ? postData : null;
  } catch (error) {
    console.warn('Error parsing wp post create command:', error);
    return null;
  }
}

function parseWpMediaImportCommand(command: string): any | null {
  try {
    // Extract the URL (first argument after 'wp media import')
    const urlMatch = command.match(/wp media import\s+"([^"]+)"/);
    if (urlMatch) {
      const mediaData: any = {
        downloadUrl: urlMatch[1]
      };

      // Extract --title
      const titleMatch = command.match(/--title="([^"]*?)"/);
      if (titleMatch) {
        mediaData.title = titleMatch[1];
      }

      // Extract --alt
      const altMatch = command.match(/--alt="([^"]*?)"/);
      if (altMatch) {
        mediaData.altText = altMatch[1];
      }

      // Extract --desc
      const descMatch = command.match(/--desc="([^"]*?)"/);
      if (descMatch) {
        mediaData.description = descMatch[1];
      }

      return mediaData;
    }
    return null;
  } catch (error) {
    console.warn('Error parsing wp media import command:', error);
    return null;
  }
}

function parseWpMenuCreateCommand(command: string): any | null {
  try {
    // Extract menu name
    const nameMatch = command.match(/wp menu create\s+"([^"]+)"/);
    if (nameMatch) {
      return {
        menuName: nameMatch[1],
        menuLocation: 'primary', // Default location
        menuItems: [] // Menu items would be added in subsequent commands
      };
    }
    return null;
  } catch (error) {
    console.warn('Error parsing wp menu create command:', error);
    return null;
  }
}

// Helper function to parse wp eval commands (more complex, simplified here)
function parseWpEvalCommand(command: string): any | null {
  // wp eval commands are complex PHP snippets
  // For now, we'll skip these during import
  // In a full implementation, you'd need to parse PHP code
  console.warn('wp eval commands are not yet supported for import');
  return null;
}