import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { business } from '@/data/content';

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | X Beauty"
        description="Privacy policy for X Beauty — how we handle your information."
      />
      <PageHeader
        title="Privacy Policy"
        subtitle="Your privacy matters to us. This page explains how X Beauty handles your information."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Privacy Policy' }]}
      />

      <section className="section-pad">
        <div className="container-x max-w-3xl">
          <div className="prose prose-neutral max-w-none">
            <div className="space-y-8 text-neutral-600 leading-relaxed">
              <div>
                <p className="text-sm text-neutral-400">Last updated: September 2026</p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">1. Introduction</h2>
                <p>
                  X Beauty ({business.address}) respects your privacy. This Privacy Policy explains what information we collect when you use our website or services, and how we use and protect it. This is a basic policy appropriate for a small business website and does not constitute legal advice.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">2. Information We Collect</h2>
                <p className="mb-3">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Information you provide:</strong> When you fill out our booking or contact forms, we collect your name, phone number, email, and any details you choose to share.</li>
                  <li><strong>Usage information:</strong> We may collect basic analytics about how visitors use our website, such as pages visited and approximate location.</li>
                  <li><strong>Communication records:</strong> When you contact us, we keep a record of our correspondence for service quality.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To respond to your appointment requests and messages.</li>
                  <li>To provide and improve our services.</li>
                  <li>To inform you about offers or updates (only if you have consented).</li>
                  <li>To maintain records for business purposes.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">4. Information Sharing</h2>
                <p>
                  We do not sell or rent your personal information. We may share information with service providers who help us operate our business (e.g., communication tools), or when required by law. We limit what they can do with your data.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">5. Data Security</h2>
                <p>
                  We take reasonable measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">6. Your Rights</h2>
                <p>
                  You may request access to, correction of, or deletion of your personal information by contacting us. We will respond in a reasonable timeframe.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">7. Cookies</h2>
                <p>
                  Our website may use basic cookies or similar technologies for functionality and analytics. You can control cookies through your browser settings.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">8. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party sites (e.g., social media, maps). We are not responsible for their privacy practices.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-charcoal mb-3">10. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none pl-0 space-y-1 mt-2">
                  <li><strong>X Beauty</strong></li>
                  <li>{business.address}</li>
                  <li>Phone: {business.phone}</li>
                  <li>Email: {business.email}</li>
                </ul>
              </div>

              <div className="bg-cream rounded-xl p-5 text-sm text-neutral-500">
                <p>This is a basic privacy policy template for a small business website and does not constitute legal advice. Please consult a legal professional for a policy tailored to your specific requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;
