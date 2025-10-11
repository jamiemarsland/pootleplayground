import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BlueprintRequest {
  prompt: string;
}

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt }: BlueprintRequest = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are an expert WordPress Blueprint generator for the Pootle Playground tool. Your task is to convert user descriptions into step configurations.

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

7. createNavigationMenu:
   {
     "id": "createNavigationMenu-{timestamp}",
     "type": "createNavigationMenu",
     "data": {
       "menuName": "Main Menu",
       "menuLocation": "primary",
       "menuItems": [
         { "type": "custom", "title": "Home", "url": "/" }
       ]
     }
   }

Common site options:
- blogname (site title)
- blogdescription (tagline)  
- permalink_structure (e.g., '/%postname%/')
- posts_per_page (number)
- default_comment_status ('open' or 'closed')

IMPORTANT RULES:
1. Always use unique IDs with timestamp: "stepType-{timestamp}"
2. For plugins/themes from WordPress.org, ALWAYS use real slugs (e.g., "contact-form-7", "hello-elementor")
3. Include rich, realistic content for posts and pages (at least 100 words)
4. Set blogname and blogdescription as first steps
5. Consider setting permalink_structure to '/%postname%/'
6. Create meaningful page slugs in postName field
7. For navigation menus, use type: "custom" with title and url
8. Always set landingPageType appropriately

Common WordPress.org plugin slugs:
- contact-form-7 (contact forms)
- wordpress-seo (Yoast SEO)
- classic-editor (classic editor)
- akismet (spam protection)
- jetpack (features suite)
- elementor (page builder)
- woocommerce (e-commerce)

Common WordPress.org theme slugs:
- twentytwentyfour
- twentytwentythree
- hello-elementor
- astra
- generatepress

Examples:

Example 1: "Create a simple blog"
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

Respond ONLY with valid JSON in this exact format:
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
}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate blueprint" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    let blueprintData: BlueprintResponse;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blueprintData = JSON.parse(jsonMatch[0]);
      } else {
        blueprintData = JSON.parse(aiResponse);
      }

      if (!blueprintData.steps || !Array.isArray(blueprintData.steps)) {
        throw new Error("Invalid blueprint structure: missing steps array");
      }

      blueprintData.steps.forEach((step, index) => {
        if (!step.id || !step.type || !step.data) {
          throw new Error(`Invalid step at index ${index}: missing id, type, or data`);
        }
      });

    } catch (parseError) {
      console.error("Failed to parse or validate AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format: " + parseError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify(blueprintData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-blueprint function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});