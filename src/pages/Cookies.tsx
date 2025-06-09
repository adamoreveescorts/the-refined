import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
const Cookies = () => {
  return <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Cookies Policy</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-lg mb-6">
                This Cookies Policy explains how Adam or Eve Escorts uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What are Cookies?</h2>
              <p className="mb-6">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Essential Cookies</h3>
              <p className="mb-4">
                These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Performance and Analytics Cookies</h3>
              <p className="mb-4">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Functionality Cookies</h3>
              <p className="mb-4">
                These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Targeting Cookies</h3>
              <p className="mb-6">
                These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Specific Cookies We Use</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-card">
                      <th className="border border-border p-3 text-left">Cookie Name</th>
                      <th className="border border-border p-3 text-left">Purpose</th>
                      <th className="border border-border p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">session_id</td>
                      <td className="border border-border p-3">Maintains user session and login status</td>
                      <td className="border border-border p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">preferences</td>
                      <td className="border border-border p-3">Stores user preferences and settings</td>
                      <td className="border border-border p-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">analytics</td>
                      <td className="border border-border p-3">Tracks website usage and performance</td>
                      <td className="border border-border p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">marketing</td>
                      <td className="border border-border p-3">Personalizes advertising content</td>
                      <td className="border border-border p-3">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
              <p className="mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Google Analytics</h3>
              <p className="mb-4">
                We use Google Analytics to analyze the use of our website. Google Analytics gathers information about website use by means of cookies.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Payment Processors</h3>
              <p className="mb-6">
                Our payment processors may set cookies to facilitate secure transactions and prevent fraud.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How to Control Cookies</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Browser Settings</h3>
              <p className="mb-4">
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Opt-Out Links</h3>
              <p className="mb-4">
                You can opt-out of certain third-party cookies using the following links:
              </p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
                <li>Facebook: <a href="https://www.facebook.com/settings?tab=ads" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">Facebook Ad Settings</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Local Storage and Similar Technologies</h2>
              <p className="mb-6">
                We may also use local storage and similar technologies to store information on your device. Local storage is different from cookies in that it can store larger amounts of data and is not automatically transmitted to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Policy</h2>
              <p className="mb-6">
                We may update this Cookies Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our use of cookies or other technologies, please contact us at:
              </p>
              
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Cookies;