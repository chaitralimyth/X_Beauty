import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Scissors, Sparkles, Users, Award } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import StylistCard from '@/components/StylistCard';
import { stylists } from '@/data/content';

const values = [
  { Icon: Heart, title: 'Personalized Care', text: 'Every client is unique. We tailor every service to your individual needs and preferences.' },
  { Icon: Scissors, title: 'Styling Expertise', text: 'Our team brings a blend of classic technique and modern creativity to every cut and style.' },
  { Icon: Sparkles, title: 'Quality First', text: 'We use premium products and maintain the highest standards of hygiene and care.' },
  { Icon: Users, title: 'Welcoming Space', text: 'A comfortable, inclusive environment where everyone feels at home — men and women alike.' },
];

const About = () => {
  return (
    <>
      <SEO
        title="About X Beauty | Premium Unisex Hair, Beauty & Grooming in Bhandup"
        description="Learn about X Beauty — a premium unisex hair, grooming, beauty and styling studio in Bhandup West, Mumbai."
      />
      <PageHeader
        title="About X Beauty"
        subtitle="A premium unisex beauty studio in Bhandup West, Mumbai — where style meets care."
        image="https://images.pexels.com/photos/7750114/pexels-photo-7750114.jpeg?auto=compress&cs=tinysrgb&w=1920"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About' }]}
      />

      {/* Story */}
      <section className="section-pad">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="eyebrow mb-3">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">Beauty, reimagined for you</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  X Beauty was founded with a simple belief: beauty services should be personal, professional, and welcoming for everyone. Located in the heart of Bhandup West, Mumbai, we've created a space where men and women alike can feel comfortable, cared for, and confident.
                </p>
                <p>
                  From precision haircuts and beard grooming to advanced colour, treatments, and skin care — our team brings skill, warmth, and genuine attention to every appointment. We don't just style hair and skin; we build relationships.
                </p>
                <p>
                  Our approach is rooted in consultation. We listen first, advise honestly, and deliver results that suit your lifestyle, not just a trend. That's the X Beauty difference.
                </p>
              </div>
              <Link to="/booking" className="btn-primary mt-8 group">
                Book an Appointment
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/7195809/pexels-photo-7195809.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="X Beauty salon reception"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream section-pad">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">What We Stand For</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl p-7 text-center hover:shadow-lg transition-shadow">
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

      {/* Experience */}
      <section className="section-pad">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/696287/pexels-photo-696287.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="X Beauty client experience"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="eyebrow mb-3">The X Beauty Experience</p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">More than a salon visit</h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  From the moment you walk in, you're greeted by a calm, clean, and thoughtfully designed space. Your appointment begins with a consultation — we discuss what you want, what works for you, and what will make you feel your best.
                </p>
                <p>
                  Throughout your service, our stylists keep you informed and comfortable. We use trusted products, maintain strict hygiene, and never rush the process. When you leave, you take with you not just a new look, but the knowledge to maintain it.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <p className="text-3xl font-serif font-medium text-accent-600">10+</p>
                  <p className="text-xs text-neutral-500 mt-1">Years Combined Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-medium text-accent-600">5</p>
                  <p className="text-xs text-neutral-500 mt-1">Service Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-medium text-accent-600">7</p>
                  <p className="text-xs text-neutral-500 mt-1">Days a Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team preview */}
      <section className="bg-cream section-pad">
        <div className="container-x">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">The People</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium">Meet Our Team</h2>
            <p className="text-neutral-600 mt-4 max-w-2xl mx-auto">
              The skilled professionals who bring X Beauty to life every day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stylists.map((s) => (
              <StylistCard key={s.name} stylist={s} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/stylists" className="btn-outline group">
              Meet the Full Team
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection title="Experience X Beauty for yourself" subtitle="Book an appointment and discover what personalized beauty care feels like." />
    </>
  );
};

export default About;
