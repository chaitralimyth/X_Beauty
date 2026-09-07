import { Link } from 'react-router-dom';
import type { ServiceCategory } from '@/data/content';
import { ArrowRight } from 'lucide-react';

type ServiceCardProps = {
  service: ServiceCategory;
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Link to={`/services/${service.slug}`} className="card group block">
      <div className="relative h-64 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-2xl font-serif text-white">{service.title}</h3>
          <p className="text-sm text-white/80 mt-1">From {service.startingPrice}</p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">{service.tagline}</p>
        <div className="flex items-center gap-2 mt-4 text-sm font-medium text-accent-600 group-hover:text-accent-700 transition-colors">
          Explore {service.shortTitle}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
