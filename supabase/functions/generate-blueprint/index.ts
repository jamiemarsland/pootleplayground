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

    const systemPrompt = `You are an expert WordPress Blueprint generator. Your task is to convert user descriptions into WordPress Playground blueprint configurations.

Available step types and their data structures:

1. installPlugin: { pluginZipFile: { resource: 'url', url: string }, options: { activate: boolean } }
2. installTheme: { themeZipFile: { resource: 'url', url: string }, options: { activate: boolean } }
3. addPost: { postTitle: string, postContent: string, postType: 'post', postStatus: 'publish', postDate: 'now', featuredImageUrl: string }
4. addPage: { postTitle: string, postContent: string, postStatus: 'publish', postName: string, postParent: string, template: string, menuOrder: string }
5. addMedia: { downloadUrl: string }
6. setSiteOption: { option: string, value: string }
7. defineWpConfigConst: { consts: { [key: string]: string | number | boolean } }
8. login: { username: string, password: string }
9. importWxr: { file: { resource: 'url', url: string } }
10. addClientRole: { name: string, capabilities: string[] }
11. setHomepage: { option: 'create', title: string, content: string }
12. setPostsPage: { option: 'create', title: string, content: string }
13. createNavigationMenu: { menuName: string, menuLocation: string, menuItems: Array<{ title: string, url: string }> }
14. setLandingPage: { landingPageType: 'wp-admin' | 'front-page' | 'custom' }

Common WordPress options for setSiteOption:
- blogname (site title)
- blogdescription (tagline)
- permalink_structure (e.g., '/%postname%/')
- show_on_front ('posts' or 'page')
- page_on_front (page ID for homepage)
- page_for_posts (page ID for blog)
- posts_per_page (number)
- default_comment_status ('open' or 'closed')

When generating blueprints:
- Always set a meaningful blogname
- Consider setting permalink_structure to '/%postname%/' for clean URLs
- If creating a static homepage, use setHomepage step
- If creating a blog page, use setPostsPage step
- Add realistic content to posts and pages
- Use real WordPress.org plugin slugs when possible
- For custom plugins/themes, use placeholder URLs like 'https://example.com/plugin.zip'

Respond ONLY with valid JSON in this exact format:
{
  "blueprintTitle": "Site Name",
  "landingPageType": "wp-admin" | "front-page" | "custom",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "unique-id-timestamp",
      "type": "stepType",
      "data": { /* step-specific data */ }
    }
  ],
  "explanation": "Brief explanation of what was created"
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
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
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