import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Stylists from '@/pages/Stylists';
import Gallery from '@/pages/Gallery';
import Offers from '@/pages/Offers';
import Booking from '@/pages/Booking';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/hair" element={<ServiceDetail />} />
          <Route path="/services/grooming" element={<ServiceDetail />} />
          <Route path="/services/hair-colour" element={<ServiceDetail />} />
          <Route path="/services/treatments" element={<ServiceDetail />} />
          <Route path="/services/skin-beauty" element={<ServiceDetail />} />
          <Route path="/stylists" element={<Stylists />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
