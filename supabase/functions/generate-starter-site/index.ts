import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { siteType, siteName, description, selectedPages, contentLevel, selectedPlugins, selectedTheme } = await req.json();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wantBody = contentLevel === "full-starter-copy";
    const wantHeadings = contentLevel !== "structure-only";

    const systemPrompt = `You are an expert WordPress site architect. Given a website description, you generate a realistic page and section structure with tailored content.

For each page the user wants, choose 2–5 appropriate sections from this list:
Hero, Features, Services Grid, Process, Story, Team, Values, Testimonials, CTA, Blog Grid, Categories, Testimonials Grid, Stats, Pricing Table, FAQ, FAQ List, Contact Form, Map, Info, Pricing, Content Section

RULES:
- Choose sections that genuinely fit the site type and description
- Vary the sections between pages — don't repeat the same sections everywhere
- Use the site's actual name, industry, and tone in all text
- Menu items should reflect the page titles

Respond ONLY with valid JSON matching this exact schema:
{
  "siteTitle": "string",
  "pages": [
    {
      "id": "string (e.g. page-0)",
      "title": "string",
      "sections": [
        {
          "id": "string (e.g. page-0-sec-0)",
          "name": "string (section name from the list above)",
          ${wantHeadings ? '"h2": "string (compelling H2 heading for this section, personalised to the site)",' : ""}
          ${wantHeadings ? '"h3": "string (short supporting subheading)"' + (wantBody ? "," : "") : ""}
          ${wantBody ? '"body": "string (2–3 sentence paragraph of real starter copy for this section)"' : ""}
        }
      ]
    }
  ],
  "menu": ["array", "of", "page", "titles"]
}

Do NOT include any text outside the JSON object.`;

    const userPrompt = `Site type: ${siteType}
Site name: ${siteName}
Description: ${description}
Pages: ${selectedPages.join(", ")}
Content level: ${contentLevel}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return new Response(JSON.stringify({ error: "Failed to generate site structure" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await response.json();
    const raw = openaiData.choices[0].message.content;

    let siteData: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      siteData = JSON.parse(match ? match[0] : raw);
    } catch (e) {
      console.error("Parse error:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ...siteData,
        plugins: selectedPlugins ?? [],
        theme: selectedTheme ?? "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
