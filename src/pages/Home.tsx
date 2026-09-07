import { Link } from 'react-router-dom';
import { ArrowRight, Scissors, Sparkles, Heart, Users, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';
import ServiceCard from '@/components/ServiceCard';
import StylistCard from '@/components/StylistCard';
import TestimonialCard from '@/components/TestimonialCard';
import CTASection from '@/components/CTASection';
import LocationSection from '@/components/LocationSection';
import { services, stylists, testimonials, popularServices, galleryImages } from '@/data/content';

const highlights = [
  { Icon: Scissors, title: 'Expert Stylists', text: 'Trained professionals with years of experience.' },
  { Icon: Sparkles, title: 'Premium Products', text: 'Only quality products for your hair and skin.' },
  { Icon: Heart, title: 'Personalized Service', text: 'Every visit starts with a consultation.' },
  { Icon: Users, title: 'Unisex Experience', text: 'A welcoming space for men and women.' },
];

const whyPoints = [
  { title: 'Personalized Consultation', text: 'We take time to understand your hair, skin, and style goals before we begin.' },
  { title: 'Experienced Professionals', text: 'Our team brings years of hands-on experience across cutting, colour, and care.' },
  { title: 'Modern Styling Techniques', text: 'We stay current with the latest trends, tools, and methods in the industry.' },
  { title: 'Quality Products', text: 'We use trusted, premium products that protect and enhance your hair and skin.' },
  { title: 'Comfortable Environment', text: 'A calm, clean, and welcoming space designed for you to relax and enjoy.' },
  { title: 'Attention to Detail', text: 'From the consultation to the final finish, every detail is intentional.' },
];

const Home = () => {
  return (
    <>
      <SEO
        title="X Beauty | Hair, Beauty & Grooming in Bhandup, Mumbai"
        description="Discover X Beauty in Bhandup, Mumbai for professional hair, grooming, colour, beauty and styling services. Explore services and request an appointment."
      />

      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7195811/pexels-photo-7195811.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="X Beauty salon interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-charcoal/20" />
        </div>
        <div className="container-x relative text-white">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow text-accent-300 mb-5">Bhandup West, Mumbai</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6">
              Your Style.<br />Your Beauty.<br />Your X.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
              Professional hair, grooming, beauty and styling experiences designed around you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking" className="btn-accent group">
                Book an Appointment
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/services" className="btn-outline border-white/30 text-white hover:bg-white hover:text-charcoal">
                Explore Services
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-10 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              Bhandup West, Mumbai
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-cream">
        <div className="container-x py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map(({ Icon, title, text }) => (
              <div key={title} className="text-center p-6 rounded-2xl bg-white/50 hover:bg-white transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-lg font-serif font-medium mb-2">{title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-pad">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium">Our Services</h2>
            <p className="text-neutral-600 mt-4 max-w-2xl mx-auto">
              From precision cuts to advanced colour and rejuvenating treatments — explore what X Beauty has to offer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Why X Beauty */}
      <section className="bg-cream section-pad">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow mb-3">Why Choose Us</p>
              <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">Why X Beauty</h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                We believe beauty is personal. That's why every service at X Beauty is built around you — your hair, your skin, your style, and your comfort. Here's what sets us apart.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {whyPoints.map((point) => (
                  <div key={point.title}>
                    <h3 className="font-serif text-lg font-medium mb-1.5">{point.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{point.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/13068377/pexels-photo-13068377.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="X Beauty salon interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services / Pricing */}
      <section className="section-pad">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Project Pricing</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium">Popular Services</h2>
            <p className="text-neutral-600 mt-4 max-w-2xl mx-auto">
              Example prices for our most-requested services. Prices may vary based on hair length, texture, and consultation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularServices.map((item) => (
              <div key={item.name} className="card p-6 text-center hover:-translate-y-1">
                <h3 className="font-serif text-lg mb-3">{item.name}</h3>
                <p className="text-2xl font-serif font-medium text-accent-600">{item.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-400 mt-8">
            These are example prices and may change. Please confirm during your visit.
          </p>
        </div>
      </section>

      {/* Offer CTA */}
      <section className="bg-charcoal text-ivory py-20 md:py-28">
        <div className="container-x text-center">
          <p className="eyebrow text-accent-300 mb-4">Special Offer</p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">Your next look starts here.</h2>
          <p className="text-ivory/70 max-w-xl mx-auto mb-8">
            Explore our latest packages and combos designed to give you a complete transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/offers" className="btn-accent">View Offers</Link>
            <Link to="/booking" className="btn-outline border-ivory/30 text-ivory hover:bg-ivory hover:text-charcoal">
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Stylists Preview */}
      <section className="section-pad">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="eyebrow mb-3">Meet the Team</p>
              <h2 className="text-4xl md:text-5xl font-serif font-medium">Our Stylists</h2>
            </div>
            <Link to="/stylists" className="text-sm font-medium text-accent-600 hover:text-accent-700 flex items-center gap-2 group">
              View all stylists
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stylists.map((s) => (
              <StylistCard key={s.name} stylist={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="bg-cream section-pad">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="eyebrow mb-3">Our Work</p>
              <h2 className="text-4xl md:text-5xl font-serif font-medium">Gallery</h2>
            </div>
            <Link to="/gallery" className="text-sm font-medium text-accent-600 hover:text-accent-700 flex items-center gap-2 group">
              View full gallery
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.slice(0, 8).map((img) => (
              <div key={img.src} className="relative rounded-xl overflow-hidden group aspect-square">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Client Love</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <LocationSection />

      {/* Final CTA */}
      <CTASection
        title="Ready for your next look?"
        subtitle="Book an appointment with X Beauty and let our experts take care of the rest."
        buttonText="Book an Appointment"
      />
    </>
  );
};

export default Home;
