import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ models: [], products: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all device models and brands for AI context
    const { data: models } = await supabase
      .from("device_models")
      .select("id, name, slug, brand:brands(id, name, slug)")
      .order("name");

    const { data: products } = await supabase
      .from("products")
      .select("id, name, slug, price, images, category:categories(name), brand:brands(name)")
      .order("created_at", { ascending: false });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modelNames = (models || []).map((m: any) => `${m.name} (${m.brand?.name || "Unknown"})`).join(", ");
    const productNames = (products || []).slice(0, 50).map((p: any) => p.name).join(", ");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a phone search assistant for a mobile accessories store. Given a user search query, return the most relevant device models and products.

Available device models: ${modelNames}

Available products (sample): ${productNames}

Return JSON with:
- "model_ids": array of device model IDs that match the query (max 10). Match by brand name, model name, series (e.g. "iPhone 15" matches all iPhone 15 variants). Be generous with matching.
- "product_keywords": array of 2-3 refined search keywords to find relevant products

If query is about a specific phone model/brand, prioritize model matches. If about accessories, prioritize product keywords.`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "search_results",
              description: "Return search results with matching model IDs and product keywords",
              parameters: {
                type: "object",
                properties: {
                  model_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "IDs of matching device models",
                  },
                  product_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Refined keywords to search products",
                  },
                },
                required: ["model_ids", "product_keywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "search_results" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", aiResponse.status, await aiResponse.text());
      // Fallback to simple text search
      return fallbackSearch(query, models || [], products || [], corsHeaders);
    }

    const aiData = await aiResponse.json();
    let parsed: { model_ids: string[]; product_keywords: string[] };

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return fallbackSearch(query, models || [], products || [], corsHeaders);
    }

    // Get matched models
    const matchedModels = (models || []).filter((m: any) => parsed.model_ids.includes(m.id));

    // Get matched products using keywords + direct name match
    const lowerQuery = query.toLowerCase();
    const matchedProducts = (products || [])
      .filter((p: any) => {
        const name = p.name.toLowerCase();
        if (name.includes(lowerQuery)) return true;
        return parsed.product_keywords.some((kw: string) => name.includes(kw.toLowerCase()));
      })
      .slice(0, 8);

    return new Response(
      JSON.stringify({
        models: matchedModels.map((m: any) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          brand_name: m.brand?.name || "",
          brand_slug: m.brand?.slug || "",
        })),
        products: matchedProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.images?.[0] || null,
          category: p.category?.name || "",
          brand: p.brand?.name || "",
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function fallbackSearch(
  query: string,
  models: any[],
  products: any[],
  corsHeaders: Record<string, string>
) {
  const lower = query.toLowerCase();
  const matchedModels = models
    .filter((m: any) => m.name.toLowerCase().includes(lower) || m.brand?.name?.toLowerCase().includes(lower))
    .slice(0, 10);
  const matchedProducts = products
    .filter((p: any) => p.name.toLowerCase().includes(lower))
    .slice(0, 8);

  return new Response(
    JSON.stringify({
      models: matchedModels.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        brand_name: m.brand?.name || "",
        brand_slug: m.brand?.slug || "",
      })),
      products: matchedProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images?.[0] || null,
        category: p.category?.name || "",
        brand: p.brand?.name || "",
      })),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
