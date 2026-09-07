import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type CTASectionProps = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
};

const CTASection = ({
  title,
  subtitle,
  buttonText = 'Book an Appointment',
  buttonLink = '/booking',
}: CTASectionProps) => {
  return (
    <section className="bg-charcoal text-ivory">
      <div className="container-x section-pad text-center">
        <p className="eyebrow text-accent-300 mb-4">X Beauty</p>
        <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-ivory/70 max-w-2xl mx-auto mb-8">{subtitle}</p>}
        <Link to={buttonLink} className="btn-accent group">
          {buttonText}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
