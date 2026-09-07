import { Check, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { offers } from '@/data/content';

const Offers = () => {
  return (
    <>
      <SEO
        title="Offers & Packages | X Beauty — Special Pricing on Hair, Grooming & Beauty"
        description="Explore current offers and packages at X Beauty in Bhandup, Mumbai — combo deals on haircuts, grooming, facials, and colour services."
      />
      <PageHeader
        title="Offers & Packages"
        subtitle="Special combos and packages designed to give you more value. Available for a limited time."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Offers' }]}
      />

      <section className="section-pad">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.title}
                className="card p-7 flex flex-col relative hover:-translate-y-1"
              >
                {offer.badge && (
                  <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-accent-500 text-white text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {offer.badge}
                  </span>
                )}
                <h3 className="text-xl font-serif font-medium mb-1">{offer.title}</h3>
                <p className="text-sm text-neutral-500 mb-4">{offer.description}</p>
                <p className="text-3xl font-serif font-medium text-accent-600 mb-5">{offer.price}</p>
                <ul className="space-y-2.5 flex-1">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Check className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/booking" className="btn-primary mt-6 w-full">Book Now</a>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-cream rounded-2xl p-8 text-center">
            <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Offers are subject to availability and may change without notice. Prices listed are example/project prices and may vary based on hair length, texture, and consultation. Please confirm pricing and offer details during your visit or when requesting an appointment.
            </p>
          </div>
        </div>
      </section>

      <CTASection
        title="Grab your offer today"
        subtitle="Request an appointment and mention the offer you'd like to avail."
      />
    </>
  );
};

export default Offers;
