import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumb?: { label: string; path?: string }[];
  children?: ReactNode;
};

const PageHeader = ({ title, subtitle, image, breadcrumb, children }: PageHeaderProps) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>
      )}
      <div className={`container-x relative ${image ? 'text-white' : ''}`}>
        {breadcrumb && (
          <nav className="flex items-center gap-2 text-sm mb-4 opacity-80">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {b.path ? (
                  <Link to={b.path} className="hover:text-accent-300 transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium">{title}</h1>
        {subtitle && (
          <p className={`mt-4 text-lg max-w-2xl ${image ? 'text-white/80' : 'text-neutral-600'}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHeader;
