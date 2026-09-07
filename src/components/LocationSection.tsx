import { MapPin, Phone, Clock } from 'lucide-react';
import { business } from '@/data/content';
import { Link } from 'react-router-dom';

const LocationSection = () => {
  return (
    <section className="section-pad">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-4">Visit Us</p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">Find X Beauty in Bhandup</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">{business.name}</p>
                  <p className="text-neutral-600">{business.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Phone</p>
                  <a href={`tel:${business.phoneRaw}`} className="text-neutral-600 hover:text-accent-600 transition-colors">
                    {business.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">Opening Hours</p>
                  <p className="text-neutral-600">{business.hours} — Every day</p>
                </div>
              </div>
            </div>
            <a
              href={business.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-8"
            >
              Get Directions
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-96 lg:h-[480px]">
            <iframe
              title="X Beauty location map"
              src="https://www.google.com/maps?q=Bhandup+West+Mumbai+Maharashtra&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
