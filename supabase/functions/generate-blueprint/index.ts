import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function loadContext(): Promise<string> {
  try {
    const contextPath = new URL("./pootle-context.md", import.meta.url).pathname;
    return await Deno.readTextFile(contextPath);
  } catch (error) {
    console.error("Failed to load context file, using fallback:", error);
    return `You must generate WordPress blueprints in Pootle format with id, type, and data fields.

Available step types: installPlugin, installTheme, addPost, addPage, addMedia, setSiteOption, defineWpConfigConst, login, importWxr, addClientRole, setHomepage, setPostsPage, createNavigationMenu, setLandingPage

CRITICAL RULES:
1. Use unique IDs with format: stepType-timestamp
2. For plugins/themes use REAL wordpress.org slugs (e.g., contact-form-7, twentytwentyfour)
3. Write realistic, detailed content (100+ words minimum for posts/pages)
4. Set blogname and blogdescription first
5. Use Gutenberg block format for content
6. Include permalink_structure setting
7. For menus: use type "custom" with title and url, or type "page" with pageSlug

Common plugins: contact-form-7, wordpress-seo, classic-editor, elementor, woocommerce
Common themes: twentytwentyfour, astra, generatepress, hello-elementor, neve`;
  }
}

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

    const contextContent = await loadContext();

    const systemPrompt = `You are an expert WordPress Blueprint generator for the Pootle Playground tool.

${contextContent}

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