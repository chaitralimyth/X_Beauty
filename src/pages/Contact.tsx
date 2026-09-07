import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import LocationSection from '@/components/LocationSection';
import { business } from '@/data/content';

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.name.trim()) e.name = 'Please enter your name';
    if (!formData.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Please enter a valid email';
    if (formData.phone && !/^[+]?[\d\s-]{10,15}$/.test(formData.phone.trim())) e.phone = 'Please enter a valid phone number';
    if (!formData.message.trim()) e.message = 'Please enter your message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <>
      <SEO
        title="Contact Us | X Beauty — Bhandup West, Mumbai"
        description="Get in touch with X Beauty in Bhandup West, Mumbai. Call +91 80708 44455 or send us a message."
      />
      <PageHeader
        title="Contact Us"
        subtitle="Have a question or want to reach out? We'd love to hear from you."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Contact' }]}
      />

      <section className="section-pad">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact form */}
            <div>
              {submitted ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-accent-600" />
                  </div>
                  <h2 className="text-2xl font-serif font-medium mb-3">Message Sent</h2>
                  <p className="text-neutral-600 mb-6">
                    Thank you, {formData.name.split(' ')[0]}. We've received your message and will get back to you soon.
                  </p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }} className="btn-outline">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-5" noValidate>
                  <div>
                    <label className="label-field" htmlFor="name">Name *</label>
                    <input id="name" type="text" className="input-field" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field" htmlFor="email">Email *</label>
                      <input id="email" type="email" className="input-field" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} aria-invalid={!!errors.email} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="label-field" htmlFor="phone">Phone</label>
                      <input id="phone" type="tel" className="input-field" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} aria-invalid={!!errors.phone} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label-field" htmlFor="message">Message *</label>
                    <textarea id="message" rows={5} className="input-field resize-none" value={formData.message} onChange={(e) => handleChange('message', e.target.value)} aria-invalid={!!errors.message} />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-serif font-medium mb-6">Get in Touch</h2>
              <div className="space-y-5">
                <div className="bg-cream rounded-xl p-5">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-accent-600 mb-1">Address</h3>
                  <p className="text-neutral-700">{business.name}</p>
                  <p className="text-neutral-600 text-sm">{business.address}</p>
                </div>
                <div className="bg-cream rounded-xl p-5">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-accent-600 mb-1">Phone</h3>
                  <a href={`tel:${business.phoneRaw}`} className="text-neutral-700 hover:text-accent-600 transition-colors">{business.phone}</a>
                </div>
                <div className="bg-cream rounded-xl p-5">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-accent-600 mb-1">Email</h3>
                  <a href={`mailto:${business.email}`} className="text-neutral-700 hover:text-accent-600 transition-colors">{business.email}</a>
                </div>
                <div className="bg-cream rounded-xl p-5">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-accent-600 mb-1">Opening Hours</h3>
                  <p className="text-neutral-700">{business.hours}</p>
                  <p className="text-neutral-500 text-sm">Every day</p>
                </div>
              </div>
              <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <LocationSection />
    </>
  );
};

export default Contact;
