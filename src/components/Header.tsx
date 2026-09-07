import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Scissors } from 'lucide-react';
import { navLinks, serviceDropdown, business } from '@/data/content';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ivory/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-x">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${scrolled ? 'bg-charcoal' : 'bg-charcoal'}`}>
              <Scissors className="w-5 h-5 text-accent-300" />
            </div>
            <span className={`text-2xl font-serif font-semibold transition-colors ${scrolled ? 'text-charcoal' : 'text-charcoal'}`}>
              {business.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.label === 'Services' ? (
                <div
                  key={link.path}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-charcoal hover:text-accent-600 transition-colors py-2">
                    Services
                    <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 pt-2 w-56 animate-slide-down">
                      <div className="bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden py-2">
                        <Link
                          to="/services"
                          className="block px-4 py-2.5 text-sm text-charcoal hover:bg-cream hover:text-accent-600 transition-colors"
                        >
                          All Services
                        </Link>
                        <div className="border-t border-neutral-100 my-1" />
                        {serviceDropdown.map((s) => (
                          <Link
                            key={s.path}
                            to={s.path}
                            className="block px-4 py-2.5 text-sm text-charcoal hover:bg-cream hover:text-accent-600 transition-colors"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-accent-600 ${
                      isActive ? 'text-accent-600' : 'text-charcoal'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link to="/booking" className="hidden sm:inline-flex btn-primary text-sm">
              Book an Appointment
            </Link>
            <button
              className="lg:hidden p-2 text-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-ivory border-t border-neutral-100 animate-slide-down">
          <nav className="container-x py-6 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.label === 'Services' ? (
                <div key={link.path}>
                  <button
                    className="w-full flex items-center justify-between py-3 text-charcoal font-medium"
                    onClick={() => setServicesOpen(!servicesOpen)}
                  >
                    Services
                    <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {servicesOpen && (
                    <div className="pl-4 flex flex-col gap-1 animate-slide-down">
                      <Link to="/services" className="py-2.5 text-sm text-neutral-600 hover:text-accent-600">
                        All Services
                      </Link>
                      {serviceDropdown.map((s) => (
                        <Link key={s.path} to={s.path} className="py-2.5 text-sm text-neutral-600 hover:text-accent-600">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `py-3 font-medium transition-colors ${
                      isActive ? 'text-accent-600' : 'text-charcoal'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
            <Link to="/booking" className="btn-primary mt-4">
              Book an Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
