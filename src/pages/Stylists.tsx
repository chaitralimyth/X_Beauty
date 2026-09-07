import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import StylistCard from '@/components/StylistCard';
import CTASection from '@/components/CTASection';
import { stylists } from '@/data/content';

const Stylists = () => {
  return (
    <>
      <SEO
        title="Our Stylists | X Beauty — Expert Hair, Colour & Beauty Professionals"
        description="Meet the talented team of stylists at X Beauty in Bhandup, Mumbai — experienced professionals in hair, colour, grooming, and skin care."
      />
      <PageHeader
        title="Our Stylists"
        subtitle="Meet the talented professionals who make every visit to X Beauty exceptional."
        image="https://images.pexels.com/photos/7195803/pexels-photo-7195803.jpeg?auto=compress&cs=tinysrgb&w=1920"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Stylists' }]}
      />

      <section className="section-pad">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stylists.map((s) => (
              <StylistCard key={s.name} stylist={s} />
            ))}
          </div>

          {/* Philosophy section */}
          <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/696287/pexels-photo-696287.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="X Beauty team at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="eyebrow mb-3">Our Philosophy</p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">
                Skill, care, and a genuine love for the craft
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Every stylist at X Beauty is chosen not just for technical skill, but for their ability to listen, advise, and make every client feel at ease. We invest in ongoing training so our team stays at the forefront of style and technique.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Whether you're here for a routine cut or a complete transformation, you're in experienced hands.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Book with your favourite stylist"
        subtitle="Request an appointment with the X Beauty specialist of your choice."
      />
    </>
  );
};

export default Stylists;
