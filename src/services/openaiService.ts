interface StepType {
  id: string;
  type: string;
  data: any;
}

interface BlueprintResponse {
  blueprintTitle: string;
  landingPageType: 'wp-admin' | 'front-page' | 'custom';
  customLandingUrl: string;
  steps: StepType[];
  explanation: string;
}

function extractAndParseJSON(text: string): BlueprintResponse {
  let jsonString = text.trim();

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  }

  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonString = jsonMatch[0];
  }

  jsonString = jsonString.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

  try {
    return JSON.parse(jsonString);
  } catch (firstError) {
    const singleLineJson = jsonString.replace(/\n\s*/g, ' ');
    try {
      return JSON.parse(singleLineJson);
    } catch (secondError) {
      const cleanedJson = jsonString
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/'/g, '"')
        .replace(/\\'/g, "'");

      return JSON.parse(cleanedJson);
    }
  }
}

export async function generateBlueprint(prompt: string, context?: string): Promise<BlueprintResponse> {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  const systemPrompt = context || `You are an expert WordPress Blueprint generator for the Pootle Playground tool. Your task is to convert user descriptions into step configurations.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations outside the JSON
2. Do NOT wrap your response in markdown code blocks like \`\`\`json
3. Do NOT include any text before or after the JSON object
4. Your entire response must be a single, valid JSON object that starts with { and ends with }

IMPORTANT: Generate steps in the Pootle format with id, type, and data fields. The frontend will convert them to WordPress Playground format.

Available step types and their EXACT data structures:

1. installPlugin:
   {
     "id": "installPlugin-{timestamp}",
     "type": "installPlugin",
     "data": {
       "pluginZipFile": {
         "resource": "wordpress.org/plugins",
         "wordpress.org/plugins": "plugin-slug"
       },
       "options": { "activate": true }
     }
   }
   OR for custom URL:
   {
     "pluginZipFile": {
       "resource": "url",
       "url": "https://example.com/plugin.zip"
     },
     "options": { "activate": true }
   }

2. installTheme:
   {
     "id": "installTheme-{timestamp}",
     "type": "installTheme",
     "data": {
       "themeZipFile": {
         "resource": "wordpress.org/themes",
         "wordpress.org/themes": "theme-slug"
       },
       "options": { "activate": true }
     }
   }

3. addPost:
   {
     "id": "addPost-{timestamp}",
     "type": "addPost",
     "data": {
       "postTitle": "Post Title",
       "postContent": "Post content here",
       "postType": "post",
       "postStatus": "publish",
       "postDate": "now",
       "featuredImageUrl": ""
     }
   }

4. addPage:
   {
     "id": "addPage-{timestamp}",
     "type": "addPage",
     "data": {
       "postTitle": "Page Title",
       "postContent": "Page content",
       "postStatus": "publish",
       "postName": "page-slug",
       "postParent": "",
       "template": "",
       "menuOrder": ""
     }
   }

5. setSiteOption:
   {
     "id": "setSiteOption-{timestamp}",
     "type": "setSiteOption",
     "data": {
       "option": "blogname",
       "value": "My Site Title"
     }
   }

6. setHomepage:
   {
     "id": "setHomepage-{timestamp}",
     "type": "setHomepage",
     "data": {
       "option": "create",
       "title": "Home",
       "content": "Welcome to my site"
     }
   }

7. setPostsPage:
   {
     "id": "setPostsPage-{timestamp}",
     "type": "setPostsPage",
     "data": {
       "option": "create",
       "title": "Blog"
     }
   }

8. createNavigationMenu:
   {
     "id": "createNavigationMenu-{timestamp}",
     "type": "createNavigationMenu",
     "data": {
       "menuName": "Main Menu",
       "menuLocation": "primary",
       "menuItems": [
         {
           "title": "Home",
           "url": "/"
         }
       ]
     }
   }

9. addMedia:
   {
     "id": "addMedia-{timestamp}",
     "type": "addMedia",
     "data": {
       "imageUrl": "https://example.com/image.jpg",
       "imageAlt": "Image description"
     }
   }

10. wpConfig:
    {
      "id": "wpConfig-{timestamp}",
      "type": "wpConfig",
      "data": {
        "wpConfig": {
          "WP_DEBUG": true,
          "WP_DEBUG_LOG": true
        }
      }
    }

11. login:
    {
      "id": "login-{timestamp}",
      "type": "login",
      "data": {
        "username": "admin",
        "password": "password"
      }
    }

12. defineClientRole:
    {
      "id": "defineClientRole-{timestamp}",
      "type": "defineClientRole",
      "data": {
        "clientRole": "administrator"
      }
    }

EXAMPLE INPUT/OUTPUT:

Example User Prompt: "Create a simple tech blog with site title 'My Tech Blog' and one blog post about React"

Example Response (your ONLY output):
{
  "blueprintTitle": "My Tech Blog",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "My Tech Blog"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Technology news and insights"
      }
    },
    {
      "id": "addPost-1",
      "type": "addPost",
      "data": {
        "postTitle": "Getting Started with React",
        "postContent": "React is a popular JavaScript library for building user interfaces. In this post, we'll explore the fundamentals of React and how to get started with your first application. React was created by Facebook and has become one of the most widely used frontend libraries...",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": ""
      }
    }
  ],
  "explanation": "Created a simple tech blog with site title and one blog post about React"
}

RESPONSE FORMAT - Your response must be ONLY this JSON structure with NO additional text:
{
  "blueprintTitle": "Site Name",
  "landingPageType": "wp-admin" | "front-page" | "custom",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "stepType-timestamp",
      "type": "stepType",
      "data": { /* step data */ }
    }
  ],
  "explanation": "Brief explanation"
}

Remember: Output ONLY the JSON object. No markdown formatting, no explanations, no code blocks.`;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!openaiResponse.ok) {
    const errorData = await openaiResponse.text();
    console.error('OpenAI API error:', errorData);
    throw new Error('Failed to generate blueprint from OpenAI');
  }

  const openaiData = await openaiResponse.json();
  const aiResponse = openaiData.choices[0].message.content;

  const blueprintData = extractAndParseJSON(aiResponse);

  if (!blueprintData.steps || !Array.isArray(blueprintData.steps)) {
    throw new Error('Invalid blueprint structure: missing steps array');
  }

  blueprintData.steps.forEach((step, index) => {
    if (!step.id || !step.type || !step.data) {
      throw new Error(`Invalid step at index ${index}: missing id, type, or data`);
    }
  });

  return blueprintData;
}
