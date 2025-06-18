
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  displayName: string;
  agencyId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, agencyId }: InvitationEmailRequest = await req.json();

    console.log("Sending invitation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Agency Invitations <onboarding@resend.dev>",
      to: [email],
      subject: "You're invited to join our escort agency!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">You're Invited!</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Hello ${displayName || 'there'},</p>
            
            <p>You've been invited to join an exclusive escort agency platform. This invitation allows you to:</p>
            
            <ul style="margin: 15px 0; padding-left: 20px;">
              <li>Create your professional profile</li>
              <li>Manage your bookings and schedule</li>
              <li>Connect with verified clients</li>
              <li>Access agency support and resources</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SITE_URL") || "https://your-domain.com"}/auth?role=escort&invitation=true" 
                 style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Accept Invitation & Sign Up
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This invitation expires in 7 days. If you have any questions, please contact the agency directly.
            </p>
          </div>
          
          <div style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
            <p>This email was sent from an escort agency platform.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-escort-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
