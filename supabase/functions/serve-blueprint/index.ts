import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const blueprintCache = new Map<string, { blueprint: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

function cleanupExpiredBlueprints() {
  const now = Date.now();
  for (const [id, data] of blueprintCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      blueprintCache.delete(id);
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (req.method === "POST" && pathname.includes("/store")) {
      const { blueprint } = await req.json();

      if (!blueprint) {
        return new Response(
          JSON.stringify({ error: "Blueprint is required" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const id = crypto.randomUUID();
      blueprintCache.set(id, {
        blueprint,
        timestamp: Date.now(),
      });

      cleanupExpiredBlueprints();

      const baseUrl = url.origin + url.pathname.replace(/\/store$/, "");
      const blueprintUrl = `${baseUrl}/get/${id}`;

      return new Response(
        JSON.stringify({ id, url: blueprintUrl }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (req.method === "GET" && pathname.includes("/get/")) {
      const id = pathname.split("/get/")[1];

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Blueprint ID is required" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const cached = blueprintCache.get(id);
      if (!cached) {
        return new Response(
          JSON.stringify({ error: "Blueprint not found or expired" }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      cleanupExpiredBlueprints();

      return new Response(
        JSON.stringify(cached.blueprint),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});