import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HotmartCheckoutRequest {
  productId: string;
  userEmail: string;
  userId: string;
  returnUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Hotmart checkout mock called");

    const { productId, userEmail, userId, returnUrl }: HotmartCheckoutRequest =
      await req.json();

    console.log("Request data:", { productId, userEmail, userId, returnUrl });

    if (!productId || !userEmail || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Simular respuesta exitosa de Hotmart
    const mockCheckoutId = `checkout_${Date.now()}`;
    const mockCheckoutUrl = `https://checkout.hotmart.com/checkout/${mockCheckoutId}?email=${encodeURIComponent(
      userEmail
    )}&product=${productId}`;

    console.log("Mock checkout created:", mockCheckoutUrl);

    // Guardar en base de datos
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("hotmart_checkouts")
      .insert({
        user_id: userId,
        email: userEmail,
        name: userEmail.split("@")[0],
        product_id: productId,
        checkout_url: mockCheckoutUrl,
        status: "pending",
        hotmart_data: {
          checkoutId: mockCheckoutId,
          mock: true,
          created_at: new Date().toISOString(),
        },
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // No fallar si hay error en DB, devolver el checkout mock
    } else {
      console.log("Checkout saved to database");
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: mockCheckoutUrl,
        checkout_id: mockCheckoutId,
        mock: true,
        message: "Mock checkout created successfully - This is a test checkout",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: "Internal server error", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});