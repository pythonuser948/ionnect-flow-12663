import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, title, category } = await req.json();
    console.log('Verifying proof:', { title, category });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI with vision to analyze the document
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a document verification assistant. Analyze the uploaded document and determine if it matches the claimed category. 
            
Categories include: Leave Letter, Refund Permission, Event Registration, Fee Receipt, Workshop Certificate, Medical Certificate, etc.

Respond in JSON format:
{
  "matches": boolean,
  "confidence": number (0-100),
  "analysis": "brief description of what you see",
  "reason": "explanation of why it matches or doesn't match"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `The student claims this is a "${category}" with title "${title}". Analyze the document and verify if it matches.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI response:', aiResponse);

    // Parse the AI response
    let verification;
    try {
      verification = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback verification
      verification = {
        matches: true,
        confidence: 50,
        analysis: aiResponse,
        reason: 'Unable to parse structured response'
      };
    }

    return new Response(
      JSON.stringify(verification),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-proof:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});