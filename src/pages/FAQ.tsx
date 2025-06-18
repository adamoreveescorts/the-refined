import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="border border-border rounded-lg mb-4 overflow-hidden"
    >
      <CollapsibleTrigger className="w-full p-4 flex justify-between items-center bg-card hover:bg-accent transition-colors text-left">
        <span className="font-serif text-lg text-foreground font-medium">{question}</span>
        {isOpen ? 
          <ChevronUp className="h-5 w-5 text-secondary" /> : 
          <ChevronDown className="h-5 w-5 text-foreground" />
        }
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-accent border-t border-border">
        <p className="text-muted-foreground">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
};

const FAQ = () => {
  const faqItems = [
    {
      question: "What is the Adam or Eve Escorts platform?",
      answer: "Adam or Eve Escorts is a premium directory connecting sophisticated companions with discerning clients. Our platform prioritizes quality, discretion, and safety for all users while offering a refined experience unlike any other in the industry."
    },
    {
      question: "How do I join as a companion?",
      answer: "To join as a companion, visit our 'Join' page and complete the application form. Our verification process ensures a safe environment for all users. After submission, our team will review your application, and you'll receive a response within 48 hours."
    },
    {
      question: "How does verification work?",
      answer: "Our verification process is thorough yet discreet. Companions must provide identification documents and professional references. Clients undergo verification that respects privacy while ensuring authenticity. This mutual verification creates a trusted environment for meaningful connections."
    },
    {
      question: "Is my privacy protected?",
      answer: "Absolutely. Privacy and discretion are foundational to our platform. We employ advanced encryption for all communications, never share your personal information with third parties, and offer confidential payment processing options. Your personal information remains secure and private."
    },
    {
      question: "What sets Adam or Eve Escorts apart from other platforms?",
      answer: "Our commitment to quality, sophisticated design, and ethical practices distinguishes us. We curate our directory carefully, maintain high verification standards, and foster a community of respect. Adam or Eve Escorts focuses on meaningful connections that transcend traditional escort experiences."
    },
    {
      question: "Are there membership fees?",
      answer: "We offer tiered membership options for both companions and clients. Basic profiles are free, while premium memberships provide enhanced visibility, priority placement, and additional features. Visit our 'Join' page for current membership plans and pricing."
    },
    {
      question: "How can I communicate with companions?",
      answer: "Once verified, clients can initiate contact through our secure messaging system. This protects privacy while facilitating clear communication. Premium members receive priority messaging and additional communication options."
    },
    {
      question: "What are your community guidelines?",
      answer: "We maintain strict community guidelines centered on respect, consent, and professionalism. Any form of harassment, illegal activity, or disrespectful behavior results in immediate removal from our platform. We actively monitor compliance to maintain our standards."
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-card py-16 lg:py-24 text-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find answers to common questions about our services and platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border border-border mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Common Questions</h2>
                </div>
                
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <FAQItem question={item.question} answer={item.answer} />
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border border-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Still Have Questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help. Feel free to reach out for personalized assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/contact" 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-6 rounded-md text-center transition-colors"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="/blog" 
                    className="bg-background hover:bg-accent text-foreground border border-border font-medium py-3 px-6 rounded-md text-center transition-colors"
                  >
                    Read Our Blog
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
