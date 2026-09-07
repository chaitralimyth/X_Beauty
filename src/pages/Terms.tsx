import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { business } from '@/data/content';

const Terms = () => {
  return (
    <>
      <SEO
        title="Terms & Conditions | X Beauty"
        description="Terms and conditions for using X Beauty services and website."
      />
      <PageHeader
        title="Terms & Conditions"
        subtitle="The terms under which X Beauty offers its services and website."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Terms & Conditions' }]}
      />

      <section className="section-pad">
        <div className="container-x max-w-3xl">
          <div className="space-y-8 text-neutral-600 leading-relaxed">
            <div>
              <p className="text-sm text-neutral-400">Last updated: September 2026</p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the X Beauty website and services, you agree to these Terms & Conditions. If you do not agree, please do not use our website or services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">2. Services</h2>
              <p>
                X Beauty provides hair, grooming, colour, treatment, and beauty services at our studio in {business.address}. We reserve the right to modify, suspend, or discontinue any service at any time. Prices and offers displayed on this website are example/project prices and may change without notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">3. Appointments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Appointment requests submitted through our website are requests only and are not confirmed until we contact you.</li>
                <li>We may request a deposit or confirmation for certain services.</li>
                <li>Please arrive on time. Late arrivals may result in a shortened service or rescheduling.</li>
                <li>Cancellations should be made at least 4 hours in advance.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">4. Pricing</h2>
              <p>
                All prices listed on this website are example/project prices and may vary based on hair length, texture, service complexity, and consultation. Final pricing will be confirmed before your service begins.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">5. Offers & Packages</h2>
              <p>
                Offers and packages are subject to availability and may change or be withdrawn without notice. Offers cannot be combined unless explicitly stated.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">6. Website Use</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree to use this website lawfully and not to misuse, hack, or disrupt it.</li>
                <li>All content on this website (text, images, design) belongs to X Beauty and may not be copied without permission.</li>
                <li>We do not guarantee that the website will be error-free or uninterrupted.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">7. Limitation of Liability</h2>
              <p>
                X Beauty is not liable for any indirect or consequential damages arising from the use of our website or services. Our liability is limited to the value of the service provided.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">8. Health & Safety</h2>
              <p>
                Please inform our staff of any allergies, skin sensitivities, or medical conditions before any service. We reserve the right to refuse a service if we believe it may be unsafe for you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms & Conditions at any time. Continued use of our website or services after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-medium text-charcoal mb-3">10. Contact</h2>
              <p>For questions about these Terms, please contact us:</p>
              <ul className="list-none pl-0 space-y-1 mt-2">
                <li><strong>X Beauty</strong></li>
                <li>{business.address}</li>
                <li>Phone: {business.phone}</li>
                <li>Email: {business.email}</li>
              </ul>
            </div>

            <div className="bg-cream rounded-xl p-5 text-sm text-neutral-500">
              <p>This is a basic terms and conditions template for a small business website and does not constitute legal advice. Please consult a legal professional for terms tailored to your specific requirements.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Terms;
