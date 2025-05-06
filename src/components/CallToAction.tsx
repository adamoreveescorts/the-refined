import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const CallToAction = () => {
  return <section className="relative py-16 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-navy z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/80"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join Our Exclusive Network</h2>
          <p className="text-lg mb-8 text-gray-100">
            Whether you're seeking companionship or offering your services, become part of our sophisticated community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-as-client">
              <Button size="lg" className="btn-gold w-full sm:w-auto">
                Join as a Client
              </Button>
            </Link>
            <Link to="/join-as-escort">
              <Button size="lg" variant="outline" className="text-white border-white w-full sm:w-auto bg-gray-900 hover:bg-gray-800">
                List Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default CallToAction;