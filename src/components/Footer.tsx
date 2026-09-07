import { Link } from 'react-router-dom';
import { Scissors, Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Clock } from 'lucide-react';
import { business, navLinks, serviceDropdown } from '@/data/content';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-x py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-serif font-semibold">{business.name}</span>
            </Link>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-xs">
              Premium unisex hair, grooming, beauty, and styling services in Bhandup West, Mumbai. Your style, your beauty, your X.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Instagram, href: business.social.instagram, label: 'Instagram' },
                { Icon: Facebook, href: business.social.facebook, label: 'Facebook' },
                { Icon: Twitter, href: business.social.twitter, label: 'Twitter' },
                { Icon: Youtube, href: business.social.youtube, label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-ivory/10 flex items-center justify-center hover:bg-accent-500 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-300 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-ivory/60 text-sm hover:text-accent-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-300 mb-5">Services</h3>
            <ul className="space-y-3">
              {serviceDropdown.map((s) => (
                <li key={s.path}>
                  <Link to={s.path} className="text-ivory/60 text-sm hover:text-accent-300 transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-300 mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-ivory/60 text-sm">
                <MapPin className="w-4 h-4 text-accent-300 mt-0.5 flex-shrink-0" />
                <span>{business.address}</span>
              </li>
              <li className="flex items-center gap-3 text-ivory/60 text-sm">
                <Phone className="w-4 h-4 text-accent-300 flex-shrink-0" />
                <a href={`tel:${business.phoneRaw}`} className="hover:text-accent-300 transition-colors">
                  {business.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-ivory/60 text-sm">
                <Clock className="w-4 h-4 text-accent-300 flex-shrink-0" />
                <span>{business.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ivory/40 text-sm">
            &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-ivory/40 text-sm hover:text-accent-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-ivory/40 text-sm hover:text-accent-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/login" className="text-ivory/40 text-sm hover:text-accent-300 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
