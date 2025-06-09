import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
const testimonials = [{
  id: 1,
  name: "J.M.",
  location: "New York",
  text: "The Refined Escort has completely transformed my experience. The verification process makes me feel secure, and the quality of connections has been excellent.",
  rating: 5
}, {
  id: 2,
  name: "S.K.",
  location: "London",
  text: "As a companion, this platform has provided me with high-quality clients and a safe way to manage my business. The verification process is thorough but respectful.",
  rating: 5
}, {
  id: 3,
  name: "A.D.",
  location: "Paris",
  text: "I appreciate the elegant design and discreet nature of this service. It stands apart from other platforms with its professional approach and premium experience.",
  rating: 4
}];
const Testimonial = ({
  testimonial
}: {
  testimonial: any;
}) => {
  return <Card className="bg-white h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-gold fill-gold' : 'text-gray-300'}`} />)}
        </div>
        <blockquote className="flex-grow">
          <p className="text-charcoal italic">&ldquo;{testimonial.text}&rdquo;</p>
        </blockquote>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="font-medium text-navy">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.location}</p>
        </div>
      </CardContent>
    </Card>;
};
const TestimonialSection = () => {
  return <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-100">What Our Users Say</h2>
          <p className="max-w-2xl mx-auto text-gray-100">
            Discover why clients and companions trust our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(testimonial => <Testimonial key={testimonial.id} testimonial={testimonial} />)}
        </div>
      </div>
    </section>;
};
export default TestimonialSection;