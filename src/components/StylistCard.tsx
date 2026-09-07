import type { Stylist } from '@/data/content';
import { Scissors } from 'lucide-react';

type StylistCardProps = {
  stylist: Stylist;
};

const StylistCard = ({ stylist }: StylistCardProps) => {
  return (
    <div className="card group overflow-hidden">
      <div className="relative h-80 overflow-hidden">
        <img
          src={stylist.image}
          alt={stylist.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-serif text-white">{stylist.name}</h3>
          <p className="text-sm text-accent-200 flex items-center gap-1.5 mt-1">
            <Scissors className="w-3.5 h-3.5" />
            {stylist.specialty}
          </p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">{stylist.experience} experience</p>
        <p className="text-sm text-neutral-600 leading-relaxed">{stylist.bio}</p>
      </div>
    </div>
  );
};

export default StylistCard;
