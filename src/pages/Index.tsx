
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HeroBanner from "@/components/HeroBanner";
import FeaturedSection from "@/components/FeaturedSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import LocationsSection from "@/components/LocationsSection";
import TestimonialSection from "@/components/TestimonialSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Function to handle animations on scroll
    const handleScroll = () => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      animatedElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
          element.classList.add('animate-fadeIn');
          element.classList.remove('opacity-0');
        }
      });
    };

    // Initial check for elements in view on page load
    setTimeout(() => {
      handleScroll();
    }, isMobile ? 800 : 100);

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow">
        <HeroBanner />
        <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '0.1s' }}>
          <FeaturedSection />
        </div>
        <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '0.2s' }}>
          <WhyChooseUs />
        </div>
        <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '0.3s' }}>
          <LocationsSection />
        </div>
        <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '0.4s' }}>
          <TestimonialSection />
        </div>
        <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '0.5s' }}>
          <CallToAction />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
