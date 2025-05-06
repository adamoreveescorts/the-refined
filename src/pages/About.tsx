import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
const About = () => {
  return <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-navy py-16 lg:py-24 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About The Refined Escort</h1>
              <p className="text-xl text-gray-300 mb-8">
                Redefining connection with elegance, sophistication, and discretion.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">Our Story</h2>
                <p className="text-charcoal mb-4">
                  Founded in 2020, The Refined Escort emerged from a vision to elevate the standards of escort services worldwide. 
                  We recognized a gap in the market for a platform that truly values sophistication, safety, and mutual respect.
                </p>
                <p className="text-charcoal mb-4">
                  What began as a boutique service in select metropolitan areas has now expanded into a global network, 
                  connecting discerning clients with exceptional companions who share our commitment to refinement and discretion.
                </p>
                <p className="text-charcoal">
                  Today, we pride ourselves on being the premier destination for those seeking meaningful connections 
                  that transcend the ordinary, fostering experiences that are as intellectually stimulating as they are personally fulfilling.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img alt="Elegant social gathering" className="w-full h-auto" src="/lovable-uploads/492644f5-27ff-4f46-9f28-d70e8dd27a8b.jpg" />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">Our Mission & Values</h2>
              <p className="text-charcoal">
                We're committed to creating a safe, respectful environment where genuine connections can flourish.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <span className="text-gold text-2xl font-serif">01</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Discretion</h3>
                <p className="text-charcoal">
                  We prioritize privacy and confidentiality in every interaction, ensuring peace of mind for all our users.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <span className="text-gold text-2xl font-serif">02</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Quality</h3>
                <p className="text-charcoal">
                  We maintain rigorous verification processes and standards to ensure exceptional experiences.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <span className="text-gold text-2xl font-serif">03</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Respect</h3>
                <p className="text-charcoal">
                  We foster a community built on mutual respect, professionalism, and ethical conduct.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        

        {/* Testimonials */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">What People Say</h2>
              <p className="text-charcoal">
                Feedback from our community of companions and clients.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="ml-4">
                    <p className="text-navy font-bold">Anonymous Client</p>
                    <div className="flex text-gold">
                      <span>★★★★★</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-charcoal italic">
                  "The verification process gave me confidence in the authenticity of the profiles. 
                  My experience was exactly as described, and the platform's discretion was impeccable."
                </blockquote>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="ml-4">
                    <p className="text-navy font-bold">Verified Companion</p>
                    <div className="flex text-gold">
                      <span>★★★★★</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-charcoal italic">
                  "The Refined Escort has transformed my professional experience. The platform attracts respectful clients,
                  handles administrative tasks efficiently, and provides a supportive community."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-16 lg:py-24 bg-navy text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Join Our Exclusive Network</h2>
              <p className="text-xl text-gray-300 mb-8">
                Experience the difference of a platform built on trust, quality, and mutual respect.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/directory">
                  <Button className="bg-white hover:bg-gray-100 text-navy font-medium text-base px-6">
                    Browse Directory
                  </Button>
                </Link>
                <Link to="/join">
                  <Button className="bg-gold hover:bg-gold/90 text-navy font-medium text-base px-6">
                    Join Today <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default About;