import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import SEO from '@/components/SEO';

const NotFound = () => {
  return (
    <>
      <SEO title="Page Not Found | X Beauty" description="The page you are looking for does not exist." />
      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="container-x text-center">
          <p className="text-8xl md:text-9xl font-serif font-medium text-accent-200">404</p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium mt-4 mb-3">Page Not Found</h1>
          <p className="text-neutral-600 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary group">
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </Link>
            <Link to="/services" className="btn-outline">Explore Services</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
