import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
const Terms = () => {
  return <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-lg mb-6">
                Welcome to Adam or Eve Escorts. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
              <p className="mb-6">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Description of Service</h2>
              <p className="mb-4">
                Adam or Eve Escorts is a directory platform that connects adult companions with clients. Our services include:
              </p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Profile creation and management for verified companions</li>
                <li>Search and discovery features for clients</li>
                <li>Secure messaging platform</li>
                <li>Payment processing for subscription services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Age Verification and Legal Compliance</h2>
              <p className="mb-4">
                By using our services, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>Your use of our services complies with all applicable local, state, and federal laws</li>
                <li>You understand that our platform facilitates connections for adult entertainment services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts and Registration</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">Account Creation</h3>
              <p className="mb-4">To access certain features, you must create an account and provide accurate information.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Account Security</h3>
              <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Verification Process</h3>
              <p className="mb-6">Companions must complete our verification process, which may include identity verification and background checks.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptable Use Policy</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Use our services for any illegal activities</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Attempt to circumvent our security measures</li>
                <li>Upload malicious software or spam</li>
                <li>Violate the intellectual property rights of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">Subscription Fees</h3>
              <p className="mb-4">Certain features require paid subscriptions. All fees are non-refundable unless otherwise stated.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Payment Processing</h3>
              <p className="mb-4">Payments are processed securely through third-party payment processors.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Automatic Renewal</h3>
              <p className="mb-6">Subscriptions automatically renew unless cancelled before the renewal date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Content and Intellectual Property</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">User Content</h3>
              <p className="mb-4">You retain ownership of content you post but grant us a license to use it for our services.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Platform Content</h3>
              <p className="mb-6">All platform content, including design, text, and logos, is owned by Adam or Eve Escorts and protected by intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy and Data Protection</h2>
              <p className="mb-6">
                Your privacy is important to us. Please review our <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimers and Limitations</h2>
              <h3 className="text-xl font-medium text-foreground mb-3">Service Availability</h3>
              <p className="mb-4">We do not guarantee uninterrupted access to our services.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Third-Party Interactions</h3>
              <p className="mb-4">We are not responsible for interactions between users that occur outside our platform.</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Limitation of Liability</h3>
              <p className="mb-6">Our liability is limited to the maximum extent permitted by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
              <p className="mb-6">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
              <p className="mb-6">
                We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Terms;