import type { Testimonial } from '@/data/content';
import { Star } from 'lucide-react';

type TestimonialCardProps = {
  testimonial: Testimonial;
};

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="card p-7 h-full flex flex-col">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent-400 text-accent-400" />
        ))}
      </div>
      <p className="text-charcoal/80 leading-relaxed flex-1 font-serif text-lg italic">
        "{testimonial.text}"
      </p>
      <div className="mt-6 pt-4 border-t border-neutral-100">
        <p className="font-medium text-charcoal">{testimonial.name}</p>
        <p className="text-sm text-neutral-500">{testimonial.service}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
