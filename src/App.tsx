
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Directory from "./pages/Directory";
import ProfilePage from "./pages/ProfilePage";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import PhotoVerificationPage from "./pages/PhotoVerificationPage";
import MessagesPage from "./pages/MessagesPage";
import ChoosePlan from "./pages/ChoosePlan";
import PaymentTest from "./pages/PaymentTest";
import PaymentCancelled from "./pages/PaymentCancelled";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import AgencyDashboardPage from "./pages/AgencyDashboardPage";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/user-profile" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/agency/dashboard" element={<AgencyDashboardPage />} />
              <Route path="/photo-verification" element={<PhotoVerificationPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/choose-plan" element={<ChoosePlan />} />
              <Route path="/payment-test" element={<PaymentTest />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
