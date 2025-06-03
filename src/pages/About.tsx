
import { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const About = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [storyVisible, setStoryVisible] = useState(false);
  const [missionVisible, setMissionVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setHeroVisible(true), 100),
      setTimeout(() => setStoryVisible(true), 300),
      setTimeout(() => setMissionVisible(true), 500),
      setTimeout(() => setTestimonialsVisible(true), 700),
      setTimeout(() => setCtaVisible(true), 900),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className={`bg-navy py-16 lg:py-24 text-white transition-all duration-700 ${
          heroVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
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
        <section className={`py-16 lg:py-20 bg-white transition-all duration-700 ${
          storyVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
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
                <img 
                  alt="Elegant social gathering" 
                  className="w-full h-auto transition-transform duration-500 hover:scale-105" 
                  src="/lovable-uploads/492644f5-27ff-4f46-9f28-d70e8dd27a8b.jpg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className={`py-16 lg:py-20 bg-gray-50 transition-all duration-700 ${
          missionVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">Our Mission & Values</h2>
              <p className="text-charcoal">
                We're committed to creating a safe, respectful environment where genuine connections can flourish.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: "01",
                  title: "Discretion",
                  description: "We prioritize privacy and confidentiality in every interaction, ensuring peace of mind for all our users."
                },
                {
                  number: "02", 
                  title: "Quality",
                  description: "We maintain rigorous verification processes and standards to ensure exceptional experiences."
                },
                {
                  number: "03",
                  title: "Respect", 
                  description: "We foster a community built on mutual respect, professionalism, and ethical conduct."
                }
              ].map((value, index) => (
                <div 
                  key={value.number}
                  className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-500 ${
                    missionVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                    <span className="text-gold text-2xl font-serif">{value.number}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-navy mb-4">{value.title}</h3>
                  <p className="text-charcoal">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={`py-16 lg:py-20 bg-gray-50 transition-all duration-700 ${
          testimonialsVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">What People Say</h2>
              <p className="text-charcoal">
                Feedback from our community of companions and clients.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  name: "Anonymous Client",
                  rating: "★★★★★",
                  testimonial: "The verification process gave me confidence in the authenticity of the profiles. My experience was exactly as described, and the platform's discretion was impeccable."
                },
                {
                  name: "Verified Companion", 
                  rating: "★★★★★",
                  testimonial: "The Refined Escort has transformed my professional experience. The platform attracts respectful clients, handles administrative tasks efficiently, and provides a supportive community."
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-500 ${
                    testimonialsVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex items-center mb-6">
                    <div className="ml-4">
                      <p className="text-navy font-bold">{testimonial.name}</p>
                      <div className="flex text-gold">
                        <span>{testimonial.rating}</span>
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-charcoal italic">
                    "{testimonial.testimonial}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className={`py-16 lg:py-24 bg-navy text-white transition-all duration-700 ${
          ctaVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Join Our Exclusive Network</h2>
              <p className="text-xl text-gray-300 mb-8">
                Experience the difference of a platform built on trust, quality, and mutual respect.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/directory">
                  <Button className="bg-white hover:bg-gray-100 text-navy font-medium text-base px-6 transition-all duration-300 hover:scale-105">
                    Browse Directory
                  </Button>
                </Link>
                <Link to="/join">
                  <Button className="bg-gold hover:bg-gold/90 text-navy font-medium text-base px-6 transition-all duration-300 hover:scale-105">
                    Join Today <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
