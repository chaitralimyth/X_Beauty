import { Link, useParams } from 'react-router-dom';
import { Clock, ArrowRight, Check } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { services, stylists } from '@/data/content';

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="pt-32 pb-20 text-center container-x">
        <h1 className="text-3xl font-serif mb-4">Service not found</h1>
        <Link to="/services" className="btn-primary">Back to Services</Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${service.title} | X Beauty — Bhandup, Mumbai`}
        description={service.tagline}
      />
      <PageHeader
        title={service.title}
        subtitle={service.tagline}
        image={service.image}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: service.title },
        ]}
      />

      <section className="section-pad">
        <div className="container-x">
          {/* Description */}
          <div className="max-w-3xl mb-16">
            <p className="text-lg text-neutral-600 leading-relaxed">{service.description}</p>
            <p className="mt-4 text-sm text-neutral-400">
              Starting from <span className="text-accent-600 font-medium">{service.startingPrice}</span>
            </p>
          </div>

          {/* Service items */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.items.map((item) => (
              <div key={item.name} className="card p-6 flex flex-col">
                <h3 className="text-xl font-serif font-medium mb-2">{item.name}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed flex-1">{item.description}</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  {item.duration}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                  <span className="text-2xl font-serif font-medium text-accent-600">{item.price}</span>
                  <Link to="/booking" className="btn-primary text-xs px-5 py-2.5">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Popular highlights */}
          <div className="mt-16 bg-cream rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-serif font-medium mb-6">Popular in {service.title}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.popular.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-accent-600" />
                  </div>
                  <span className="text-sm text-neutral-700">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stylist suggestion */}
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-medium mb-6 text-center">Our Specialists</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stylists.map((s) => (
                <Link key={s.name} to="/stylists" className="group text-center">
                  <div className="relative h-56 rounded-xl overflow-hidden mb-3">
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-serif text-lg">{s.name}</h4>
                  <p className="text-sm text-neutral-500">{s.specialty}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title={`Ready to book your ${service.title.toLowerCase()} service?`}
        subtitle="Request an appointment and we'll confirm your slot."
        buttonText="Book an Appointment"
      />
    </>
  );
};

export default ServiceDetail;
