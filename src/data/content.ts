export const business = {
  name: 'X Beauty',
  tagline: 'Your Style. Your Beauty. Your X.',
  phone: '+91 80708 44455',
  phoneRaw: '+918070844455',
  email: 'hello@xbeauty.in',
  address: 'Bhandup West, Mumbai, Maharashtra',
  hours: '10:00 AM – 10:00 PM',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bhandup+West+Mumbai+Maharashtra',
  social: {
    instagram: '#',
    facebook: '#',
    twitter: '#',
    youtube: '#',
  },
};

export type ServiceItem = {
  name: string;
  description: string;
  duration: string;
  price: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  image: string;
  startingPrice: string;
  popular: string[];
  items: ServiceItem[];
};

export const services: ServiceCategory[] = [
  {
    slug: 'hair',
    title: 'Hair',
    shortTitle: 'Hair',
    tagline: 'Precision cuts and effortless styling for every occasion',
    description:
      'From classic cuts to advanced styling, our stylists craft looks tailored to your face shape, hair texture, and lifestyle. Every visit begins with a personal consultation.',
    image: 'https://images.pexels.com/photos/14615063/pexels-photo-14615063.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startingPrice: '₹250',
    popular: ["Women's Haircut", "Men's Haircut", 'Blow Dry', 'Advanced Styling'],
    items: [
      { name: "Women's Haircut", description: 'Personalised cut with consultation, wash, and finish.', duration: '45–60 min', price: '₹600' },
      { name: "Men's Haircut", description: 'Tailored cut with wash and styling.', duration: '30–40 min', price: '₹250' },
      { name: "Kids' Haircut", description: 'Gentle, patient cuts for children under 12.', duration: '20–30 min', price: '₹200' },
      { name: 'Hair Wash & Styling', description: 'Shampoo, condition, and blow-dry finish.', duration: '30 min', price: '₹500' },
      { name: 'Blow Dry', description: 'Smooth, voluminous blow-dry for any occasion.', duration: '30–45 min', price: '₹400' },
      { name: 'Advanced Styling', description: 'Curls, waves, updos, and occasion styling.', duration: '60–90 min', price: '₹1,000' },
      { name: 'Hair Consultation', description: 'In-depth assessment of hair health and goals.', duration: '20 min', price: '₹300' },
    ],
  },
  {
    slug: 'grooming',
    title: 'Grooming',
    shortTitle: 'Grooming',
    tagline: 'Sharp, modern grooming for the discerning man',
    description:
      'Beard sculpting, classic shaves, and complete grooming packages delivered with precision and care. Walk in, leave sharp.',
    image: 'https://images.pexels.com/photos/3998408/pexels-photo-3998408.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startingPrice: '₹150',
    popular: ['Beard Trim & Shape', "Men's Grooming", 'Hair + Beard Package'],
    items: [
      { name: 'Beard Trim', description: 'Clean, even trim to your preferred length.', duration: '15–20 min', price: '₹150' },
      { name: 'Beard Styling', description: 'Shaped and styled with products for a polished finish.', duration: '25–30 min', price: '₹250' },
      { name: 'Beard Shape', description: 'Detailed sculpting to complement your face shape.', duration: '25–30 min', price: '₹300' },
      { name: "Men's Grooming", description: 'Haircut, beard styling, and clean-up in one session.', duration: '50–60 min', price: '₹600' },
      { name: 'Hair + Beard Package', description: 'Cut and beard styling at a combined value price.', duration: '50–60 min', price: '₹499' },
    ],
  },
  {
    slug: 'hair-colour',
    title: 'Hair Colour',
    shortTitle: 'Hair Colour',
    tagline: 'Dimension, depth, and luminous colour crafted for you',
    description:
      'From subtle root touch-ups to bold fashion colour and balayage, our colour specialists use premium products for rich, long-lasting results.',
    image: 'https://images.pexels.com/photos/8468125/pexels-photo-8468125.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startingPrice: '₹500',
    popular: ['Global Colour', 'Highlights', 'Balayage', 'Colour Consultation'],
    items: [
      { name: 'Global Colour', description: 'Full-head colour application for a uniform shade.', duration: '90–120 min', price: '₹1,500' },
      { name: 'Highlights', description: 'Strategic lightened strands for dimension.', duration: '120–150 min', price: '₹2,500' },
      { name: 'Balayage', description: 'Hand-painted, natural-looking gradient colour.', duration: '150–180 min', price: '₹3,500' },
      { name: 'Root Touch-Up', description: 'Colour refresh at the roots for maintained looks.', duration: '60–75 min', price: '₹800' },
      { name: 'Fashion Colour', description: 'Bold, creative shades for a statement look.', duration: '120–180 min', price: '₹3,000' },
      { name: 'Colour Consultation', description: 'Patch test, shade selection, and aftercare plan.', duration: '20 min', price: '₹500' },
    ],
  },
  {
    slug: 'treatments',
    title: 'Hair Treatments',
    shortTitle: 'Treatments',
    tagline: 'Nourish, repair, and transform your hair',
    description:
      'Restorative treatments designed to improve texture, manageability, and shine. Our specialists recommend the right treatment for your hair type and concerns.',
    image: 'https://images.pexels.com/photos/4783292/pexels-photo-4783292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startingPrice: '₹800',
    popular: ['Hair Spa', 'Keratin Treatment', 'Smoothening', 'Deep Conditioning'],
    items: [
      { name: 'Hair Spa', description: 'Deep-cleansing, massaging, and conditioning ritual.', duration: '45–60 min', price: '₹800' },
      { name: 'Keratin Treatment', description: 'Smoothes frizz and adds shine for manageable hair.', duration: '120–150 min', price: '₹4,000' },
      { name: 'Smoothening', description: 'Reduces volume and frizz for a sleek finish.', duration: '120–180 min', price: '₹3,500' },
      { name: 'Repair Treatment', description: 'Targets damage from colour, heat, or environment.', duration: '60 min', price: '₹1,200' },
      { name: 'Scalp Care', description: 'Cleansing and balancing treatment for scalp health.', duration: '45 min', price: '₹900' },
      { name: 'Deep Conditioning', description: 'Intensive moisture mask for soft, hydrated hair.', duration: '30–45 min', price: '₹600' },
    ],
  },
  {
    slug: 'skin-beauty',
    title: 'Skin & Beauty',
    shortTitle: 'Skin & Beauty',
    tagline: 'Glow from within with expert skin and beauty care',
    description:
      'Facials, clean-ups, and essential beauty services to refresh and rejuvenate. Every treatment is tailored to your skin type and goals.',
    image: 'https://images.pexels.com/photos/12115040/pexels-photo-12115040.jpeg?auto=compress&cs=tinysrgb&w=1200',
    startingPrice: '₹400',
    popular: ['Facials', 'Cleanup', 'Threading', 'Waxing'],
    items: [
      { name: 'Facials', description: 'Customised facial for your skin type and concerns.', duration: '45–60 min', price: '₹900' },
      { name: 'Cleanup', description: 'Cleanse, exfoliate, and refresh for a quick glow.', duration: '30 min', price: '₹500' },
      { name: 'Skin Care', description: 'Targeted treatments for hydration and radiance.', duration: '45 min', price: '₹800' },
      { name: 'Threading', description: 'Precise brow and facial hair threading.', duration: '10–15 min', price: '₹50' },
      { name: 'Waxing', description: 'Smooth, hygienic waxing for face and body.', duration: '15–45 min', price: '₹400' },
      { name: 'Basic Beauty Services', description: 'Everyday beauty essentials tailored to you.', duration: 'Varies', price: '₹400' },
    ],
  },
];

export type Stylist = {
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  image: string;
};

export const stylists: Stylist[] = [
  {
    name: 'Aarav',
    specialty: 'Senior Hair Stylist',
    experience: '12 years',
    bio: 'Aarav trained in Mumbai and London, specialising in precision cuts and editorial styling. He believes a great cut should look effortless and grow out beautifully.',
    image: 'https://images.pexels.com/photos/8468140/pexels-photo-8468140.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Meera',
    specialty: 'Hair & Colour Specialist',
    experience: '10 years',
    bio: 'Meera is known for her dimensional colour work — from sun-kissed balayage to bold fashion shades. She takes time to understand your lifestyle before mixing a single bowl.',
    image: 'https://images.pexels.com/photos/8834025/pexels-photo-8834025.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Rohan',
    specialty: 'Grooming Specialist',
    experience: '8 years',
    bio: 'Rohan brings a modern, meticulous approach to men\'s grooming. From sharp beard sculpting to complete grooming packages, he makes sure every detail is intentional.',
    image: 'https://images.pexels.com/photos/3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Anaya',
    specialty: 'Beauty & Skin Specialist',
    experience: '9 years',
    bio: 'Anaya combines classic beauty techniques with a deep understanding of skin. Her facials and treatments are tailored to each client, leaving skin refreshed and radiant.',
    image: 'https://images.pexels.com/photos/8834020/pexels-photo-8834020.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
  category: 'Hair' | 'Colour' | 'Grooming' | 'Beauty' | 'Styling' | 'Studio';
};

export const galleryImages: GalleryImage[] = [
  { src: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Glamorous curled hair styling', category: 'Styling' },
  { src: 'https://images.pexels.com/photos/8468125/pexels-photo-8468125.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Hair colour application with foil', category: 'Colour' },
  { src: 'https://images.pexels.com/photos/3998408/pexels-photo-3998408.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Beard grooming session', category: 'Grooming' },
  { src: 'https://images.pexels.com/photos/12115040/pexels-photo-12115040.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Facial treatment at spa', category: 'Beauty' },
  { src: 'https://images.pexels.com/photos/7755216/pexels-photo-7755216.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Haircut in salon', category: 'Hair' },
  { src: 'https://images.pexels.com/photos/2799605/pexels-photo-2799605.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Hair colour process', category: 'Colour' },
  { src: 'https://images.pexels.com/photos/13068377/pexels-photo-13068377.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Modern salon interior', category: 'Studio' },
  { src: 'https://images.pexels.com/photos/14615063/pexels-photo-14615063.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Blow-dry styling', category: 'Styling' },
  { src: 'https://images.pexels.com/photos/3998405/pexels-photo-3998405.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Beard styling in barbershop', category: 'Grooming' },
  { src: 'https://images.pexels.com/photos/7446659/pexels-photo-7446659.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Facial skincare treatment', category: 'Beauty' },
  { src: 'https://images.pexels.com/photos/7195811/pexels-photo-7195811.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Salon styling area', category: 'Studio' },
  { src: 'https://images.pexels.com/photos/4981476/pexels-photo-4981476.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Vibrant hair colour application', category: 'Colour' },
  { src: 'https://images.pexels.com/photos/12774463/pexels-photo-12774463.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Professional hair styling', category: 'Hair' },
  { src: 'https://images.pexels.com/photos/7697481/pexels-photo-7697481.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Straight razor grooming', category: 'Grooming' },
  { src: 'https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Relaxing facial at spa', category: 'Beauty' },
  { src: 'https://images.pexels.com/photos/7750114/pexels-photo-7750114.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Contemporary salon interior', category: 'Studio' },
  { src: 'https://images.pexels.com/photos/15507425/pexels-photo-15507425.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Bridal updo styling', category: 'Styling' },
  { src: 'https://images.pexels.com/photos/7195803/pexels-photo-7195803.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Barber shop interior', category: 'Studio' },
];

export type Testimonial = {
  name: string;
  service: string;
  rating: number;
  text: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Priya S.',
    service: 'Hair Colour & Highlights',
    rating: 5,
    text: 'Meera understood exactly what I wanted. The balayage looks natural and has lasted beautifully. X Beauty is now my go-to salon in Bhandup.',
  },
  {
    name: 'Karan M.',
    service: "Men's Grooming",
    rating: 5,
    text: 'Rohan is a true professional. The beard shape was precise and the whole experience was premium. Finally a salon that gets men\'s grooming right.',
  },
  {
    name: 'Sneha R.',
    service: 'Keratin Treatment',
    rating: 5,
    text: 'My hair has never felt this smooth and manageable. The consultation before the treatment was thorough and honest. Highly recommend.',
  },
  {
    name: 'Aditya K.',
    service: "Men's Haircut",
    rating: 5,
    text: 'Clean, quick, and exactly what I asked for. The atmosphere is calm and the staff are genuinely friendly. Worth every rupee.',
  },
  {
    name: 'Fatima A.',
    service: 'Facial & Cleanup',
    rating: 5,
    text: 'Anaya tailored the facial to my skin and it showed. My skin was glowing for days. The whole experience felt luxurious without being intimidating.',
  },
  {
    name: 'Rahul D.',
    service: 'Hair + Beard Package',
    rating: 5,
    text: 'Great value for the package. Both the cut and beard styling were on point. Booking was easy and they respected my time. Will return.',
  },
];

export type Offer = {
  title: string;
  description: string;
  price: string;
  features: string[];
  badge?: string;
};

export const offers: Offer[] = [
  {
    title: 'Fresh Look Package',
    description: 'Haircut + Styling',
    price: '₹699',
    features: ['Consultation', 'Precision haircut', 'Wash & style finish'],
    badge: 'Popular',
  },
  {
    title: 'Grooming Combo',
    description: 'Haircut + Beard Styling',
    price: '₹499',
    features: ['Haircut', 'Beard trim & shape', 'Styling finish'],
  },
  {
    title: 'Glow Package',
    description: 'Cleanup + Facial',
    price: '₹1,299',
    features: ['Express cleanup', 'Customised facial', 'Skin consultation'],
    badge: 'Best Value',
  },
  {
    title: 'Colour Consultation',
    description: 'Complimentary with selected colour services',
    price: 'Free',
    features: ['Shade selection', 'Patch test', 'Aftercare guidance'],
  },
];

export type PopularService = {
  name: string;
  price: string;
};

export const popularServices: PopularService[] = [
  { name: "Men's Classic Haircut", price: '₹250' },
  { name: 'Haircut + Wash + Styling', price: '₹500' },
  { name: 'Beard Trim & Shape', price: '₹150' },
  { name: "Women's Haircut", price: '₹600' },
  { name: 'Advanced Hair Styling', price: '₹1,000' },
  { name: 'Hair Colour Consultation', price: '₹500' },
  { name: 'Hair Spa / Treatment', price: '₹800' },
  { name: 'Facial / Skin Care', price: '₹900' },
];

export const serviceDropdown = [
  { label: 'Hair', path: '/services/hair' },
  { label: 'Grooming', path: '/services/grooming' },
  { label: 'Hair Colour', path: '/services/hair-colour' },
  { label: 'Hair Treatments', path: '/services/treatments' },
  { label: 'Skin & Beauty', path: '/services/skin-beauty' },
];

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Stylists', path: '/stylists' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Offers', path: '/offers' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];
