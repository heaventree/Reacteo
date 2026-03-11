import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const method = req.method;
    const isActive = url.searchParams.get("active") === "true";

    if (method === "GET") {
      // Get AI models
      let query = supabase.from("ai_models").select("*");

      if (isActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      // Create new AI model
      const body = await req.json();

      const { data, error } = await supabase
        .from("ai_models")
        .insert([
          {
            name: body.name,
            provider: body.provider,
            api_key_name: body.apiKeyName,
            model_id: body.modelId,
            is_active: body.isActive || false,
            max_tokens: body.maxTokens || 4096,
            temperature: body.temperature || 0.7,
          },
        ])
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data[0]), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "PUT") {
      // Update AI model
      const body = await req.json();
      const modelId = url.searchParams.get("id");

      if (!modelId) {
        return new Response(JSON.stringify({ error: "Model ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("ai_models")
        .update({
          is_active: body.isActive,
          max_tokens: body.maxTokens,
          temperature: body.temperature,
          updated_at: new Date().toISOString(),
        })
        .eq("id", modelId)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
