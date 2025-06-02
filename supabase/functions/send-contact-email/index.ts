
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormData = await req.json();

    // Send notification email to both business addresses
    const notificationEmail = await resend.emails.send({
      from: "Contact Form <noreply@adamoreveescorts.com>",
      to: ["info@adamoreveescorts.com", "info@eternalsecurity.com.au"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from the contact form on adamoreveescorts.com</p>
      `,
    });

    // Send confirmation email to the person who submitted the form
    const confirmationEmail = await resend.emails.send({
      from: "Adam or Eve Escorts <noreply@adamoreveescorts.com>",
      to: [email],
      subject: "Thank you for contacting us",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Thank you for contacting us, ${name}!</h1>
          <p>We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 3px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <p>If you have any urgent inquiries, please don't hesitate to call us at +61 411 828 184.</p>
          
          <p>Best regards,<br>The Adam or Eve Escorts Team</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Adam or Eve Escorts<br>
            Email: info@adamoreveescorts.com<br>
            Phone: +61 411 828 184<br>
            Address: PO Box 55 Liverpool NSW 1871
          </p>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { notificationEmail, confirmationEmail });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
