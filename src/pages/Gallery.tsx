import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import { galleryImages } from '@/data/content';
import type { GalleryImage } from '@/data/content';

const filters = ['All', 'Hair', 'Colour', 'Grooming', 'Beauty', 'Styling', 'Studio'] as const;

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered: GalleryImage[] =
    activeFilter === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  }, [filtered.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  return (
    <>
      <SEO
        title="Gallery | X Beauty — Hair, Colour, Grooming & Beauty Portfolio"
        description="Browse the X Beauty gallery — a showcase of our hair, colour, grooming, beauty, styling, and studio work in Bhandup, Mumbai."
      />
      <PageHeader
        title="Gallery"
        subtitle="A glimpse into the transformations and moments at X Beauty."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Gallery' }]}
      />

      <section className="section-pad">
        <div className="container-x">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === f
                    ? 'bg-charcoal text-ivory'
                    : 'bg-cream text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
            {filtered.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setLightboxIndex(i)}
                className="relative w-full rounded-xl overflow-hidden group block break-inside-avoid"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                    <p className="text-accent-200 text-xs">{img.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-neutral-400 py-12">No images in this category yet.</p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/95 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-5 text-white p-2 hover:text-accent-300 transition-colors"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white p-2 hover:text-accent-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <figure className="max-w-4xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightboxIndex].src}
              alt={filtered[lightboxIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <figcaption className="text-center text-white/70 text-sm mt-4">
              {filtered[lightboxIndex].alt} — {filtered[lightboxIndex].category}
            </figcaption>
          </figure>
          <button
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white p-2 hover:text-accent-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      <CTASection title="Love what you see?" subtitle="Book an appointment and let us create your next look." />
    </>
  );
};

export default Gallery;
