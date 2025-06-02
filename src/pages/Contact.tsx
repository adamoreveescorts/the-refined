
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters."
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters."
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to our terms and privacy policy."
  })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      agreeToTerms: false
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        }
      });

      if (error) {
        throw error;
      }

      if (response?.success) {
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for your message. We'll get back to you shortly. Please check your email for confirmation."
        });
        form.reset();
      } else {
        throw new Error(response?.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error Sending Message",
        description: "There was a problem sending your message. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      description: "Our friendly team is here to help.",
      contact: "info@adamoreveescorts.com"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      description: "Available for your inquiries.",
      contact: "+61 411 828 184"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      description: "Our mailing address.",
      contact: "PO Box 55 Liverpool NSW 1871"
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-navy py-16 lg:py-24 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-3xl mx-auto text-center" 
              initial="hidden" 
              animate="visible" 
              variants={fadeIn} 
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Get in Touch</h1>
              <p className="text-xl text-gray-300 mb-8">
                We'd love to hear from you. Our team is always here to help.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {contactInfo.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center" 
                  initial="hidden" 
                  animate="visible" 
                  variants={fadeIn} 
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-gold">{item.icon}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-gray-500 mb-3">{item.description}</p>
                  <p className="text-navy font-medium">{item.contact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="grid md:grid-cols-2 gap-8 items-center" 
                initial="hidden" 
                animate="visible" 
                variants={fadeIn} 
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div>
                  <h2 className="font-serif text-3xl font-bold text-navy mb-6">Send Us a Message</h2>
                  <p className="text-charcoal mb-6">
                    Whether you have a question about our services, membership, or anything else, our team is ready to answer all your questions.
                  </p>
                </div>
                
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="How can we help?" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Your message..." 
                                className="min-h-32" 
                                {...field} 
                                disabled={isSubmitting} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={isSubmitting} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the terms of service and privacy policy
                              </FormLabel>
                              <FormDescription>
                                By submitting this form, you consent to our privacy policy.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending Message..." : "Submit Message"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
