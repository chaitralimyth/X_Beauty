import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import CTASection from '@/components/CTASection';
import { services } from '@/data/content';

const Services = () => {
  return (
    <>
      <SEO
        title="Services | X Beauty — Hair, Grooming, Colour & Beauty in Bhandup"
        description="Explore the full range of services at X Beauty: haircuts, grooming, hair colour, treatments, skin and beauty services in Bhandup West, Mumbai."
      />
      <PageHeader
        title="Our Services"
        subtitle="Premium unisex hair, grooming, colour, treatment, and beauty services — all under one roof in Bhandup West."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services' }]}
      />
      <section className="section-pad">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>

          {/* Detailed cards */}
          <div className="mt-20 space-y-12">
            {services.map((s) => (
              <div key={s.slug} className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <p className="eyebrow mb-2">Starting from {s.startingPrice}</p>
                  <h2 className="text-3xl font-serif font-medium mb-3">{s.title}</h2>
                  <p className="text-neutral-600 leading-relaxed mb-5">{s.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {s.popular.map((p) => (
                      <span key={p} className="text-xs px-3 py-1.5 rounded-full bg-cream text-neutral-700">
                        {p}
                      </span>
                    ))}
                  </div>
                  <Link to={`/services/${s.slug}`} className="btn-primary group">
                    Explore {s.shortTitle}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection title="Not sure which service is right for you?" subtitle="Book a consultation and our stylists will help you decide." />
    </>
  );
};

export default Services;
