import { useState } from 'react';
import { CheckCircle2, Loader2, Calendar } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { services, stylists, business } from '@/data/content';

type FormErrors = {
  fullName?: string;
  phone?: string;
  email?: string;
  service?: string;
  date?: string;
  time?: string;
  consent?: string;
};

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: '',
    stylist: '',
    date: '',
    time: '',
    notes: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allServiceOptions = services.flatMap((s) =>
    s.items.map((item) => ({ label: `${item.name} (${s.shortTitle})`, value: `${s.shortTitle} — ${item.name}` }))
  );

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.fullName.trim()) e.fullName = 'Please enter your full name';
    if (!formData.phone.trim()) e.phone = 'Please enter your phone number';
    else if (!/^[+]?[\d\s-]{10,15}$/.test(formData.phone.trim())) e.phone = 'Please enter a valid phone number';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Please enter a valid email';
    if (!formData.service) e.service = 'Please select a service';
    if (!formData.date) e.date = 'Please select a preferred date';
    if (!formData.time) e.time = 'Please select a preferred time';
    if (!formData.consent) e.consent = 'Please provide your consent to be contacted';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: string, value: string | boolean) => {
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
    }, 1200);
  };

  if (submitted) {
    return (
      <>
        <SEO title="Appointment Request Received | X Beauty" description="Your appointment request has been received." />
        <section className="pt-32 pb-20 min-h-screen flex items-center">
          <div className="container-x">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-accent-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">Appointment Request Received</h1>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Thank you, {formData.fullName.split(' ')[0]}. Your request has been received. X Beauty will contact you at {formData.phone} to confirm your appointment for {formData.service}. Please note this is a request — your appointment is not confirmed until we reach out to you.
              </p>
              <div className="bg-cream rounded-2xl p-6 text-left mb-8">
                <h2 className="text-sm font-medium uppercase tracking-wide text-accent-600 mb-3">Your Request</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-neutral-500">Name</dt><dd>{formData.fullName}</dd></div>
                  <div className="flex justify-between"><dt className="text-neutral-500">Phone</dt><dd>{formData.phone}</dd></div>
                  {formData.email && <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd>{formData.email}</dd></div>}
                  <div className="flex justify-between"><dt className="text-neutral-500">Service</dt><dd>{formData.service}</dd></div>
                  {formData.stylist && <div className="flex justify-between"><dt className="text-neutral-500">Stylist</dt><dd>{formData.stylist}</dd></div>}
                  <div className="flex justify-between"><dt className="text-neutral-500">Date</dt><dd>{formData.date}</dd></div>
                  <div className="flex justify-between"><dt className="text-neutral-500">Time</dt><dd>{formData.time}</dd></div>
                </dl>
              </div>
              <button onClick={() => setSubmitted(false)} className="btn-outline">
                Make Another Request
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Book an Appointment | X Beauty — Bhandup West, Mumbai"
        description="Request an appointment at X Beauty in Bhandup West, Mumbai. Choose your service, stylist, preferred date and time."
      />
      <PageHeader
        title="Book an Appointment"
        subtitle="Fill in the form below and we'll contact you to confirm your appointment."
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Booking' }]}
      />

      <section className="section-pad">
        <div className="container-x max-w-3xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 md:p-10 space-y-6" noValidate>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-field" htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  className="input-field"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="label-field" htmlFor="phone">Phone *</label>
                <input
                  id="phone"
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="label-field" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-field" htmlFor="service">Service *</label>
                <select
                  id="service"
                  className="input-field"
                  value={formData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  aria-invalid={!!errors.service}
                >
                  <option value="">Select a service</option>
                  {allServiceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>
              <div>
                <label className="label-field" htmlFor="stylist">Preferred Stylist</label>
                <select
                  id="stylist"
                  className="input-field"
                  value={formData.stylist}
                  onChange={(e) => handleChange('stylist', e.target.value)}
                >
                  <option value="">No preference</option>
                  {stylists.map((s) => (
                    <option key={s.name} value={s.name}>{s.name} — {s.specialty}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-field" htmlFor="date">Preferred Date *</label>
                <input
                  id="date"
                  type="date"
                  className="input-field"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleChange('date', e.target.value)}
                  aria-invalid={!!errors.date}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="label-field" htmlFor="time">Preferred Time *</label>
                <input
                  id="time"
                  type="time"
                  className="input-field"
                  value={formData.time}
                  min="10:00"
                  max="21:30"
                  onChange={(e) => handleChange('time', e.target.value)}
                  aria-invalid={!!errors.time}
                />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="label-field" htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                rows={4}
                className="input-field resize-none"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any specific requests or details you'd like us to know..."
              />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-400"
                  checked={formData.consent}
                  onChange={(e) => handleChange('consent', e.target.checked)}
                  aria-invalid={!!errors.consent}
                />
                <span className="text-sm text-neutral-600 leading-relaxed">
                  I agree to be contacted by X Beauty at the phone number or email provided to confirm my appointment. I understand this is a request and not a confirmed booking.
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Request Appointment
                </>
              )}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              This is a frontend-only request form. No data is stored. X Beauty will contact you to confirm.
            </p>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-500">
            <p>Prefer to call? Reach us at <a href={`tel:${business.phoneRaw}`} className="text-accent-600 font-medium">{business.phone}</a></p>
            <p className="mt-1">Open {business.hours}, every day</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Booking;
