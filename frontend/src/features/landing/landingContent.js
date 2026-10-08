const img = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const brand = {
  name: 'Shaheen Hostel',
  shortName: 'Shaheen',
  tagline: 'Your home away from home',
  seoTitleSuffix: 'Safe & Affordable Student Hostel',
  description:
    'Shaheen Hostel offers safe, comfortable and affordable rooms with high-speed WiFi, hygienic meals, 24/7 security and study rooms. Book a visit today.',
};

// REPLACE with your real details.
export const contact = {
  phoneDisplay: '+92 300 0000000',
  phoneTel: '+923000000000',
  whatsapp: '923000000000', // digits only: country code + number, no "+" or spaces
  email: 'info@shaheenhostel.com',
  address: 'Main University Road, Peshawar, Khyber Pakhtunkhwa, Pakistan',
  hours: 'Visit us daily, 9:00 AM – 8:00 PM',
  facebook: '#',
  instagram: '#',
};

// REPLACE: easiest is Google Maps -> search your hostel -> Share -> "Embed a map"
// -> copy ONLY the src="..." URL into embedUrl. Add lat/lng for precise directions.
export const mapConfig = {
  query: 'Shaheen Hostel, Peshawar',
  embedUrl: '',
  lat: null,
  lng: null,
};

export const navLinks = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Food', href: '#food' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Location', href: '#location' },
  { label: 'Contact', href: '#contact' },
];

export const heroSlides = [
  {
    src: img('photo-1555854877-bab0e564b8d5', 1800),
    alt: 'Comfortable shared hostel room',
    caption: 'Comfortable rooms',
  },
  {
    src: img('photo-1564013799919-ab600027ffc6', 1800),
    alt: 'Modern hostel building',
    caption: 'A safe, modern building',
  },
  {
    src: img('photo-1522202176988-66273c2fd55f', 1800),
    alt: 'Students studying together',
    caption: 'A community that studies together',
  },
];

export const heroWords = ['Comfortable', 'Secure', 'Affordable', 'Welcoming'];

export const stats = [
  { value: 60, suffix: '+', label: 'Rooms' },
  { value: 250, suffix: '+', label: 'Happy residents' },
  { value: 8, suffix: '+', label: 'Years of trust' },
  { value: 4.8, suffix: '/5', label: 'Resident rating', decimals: true },
];

export const features = [
  {
    icon: 'shield',
    title: '24/7 Security',
    desc: 'CCTV, a guarded gate and a visitor log for complete peace of mind.',
  },
  {
    icon: 'wifi',
    title: 'High-Speed WiFi',
    desc: 'Fast, reliable internet in every room and study area.',
  },
  {
    icon: 'food',
    title: 'Hygienic Mess',
    desc: 'Fresh, home-style meals three times a day from a clean kitchen.',
  },
  {
    icon: 'laundry',
    title: 'Laundry Service',
    desc: 'Washing machines and a laundry service so you never fall behind.',
  },
  {
    icon: 'power',
    title: 'Backup Power',
    desc: 'Generator and UPS so your studies never stop during load-shedding.',
  },
  {
    icon: 'study',
    title: 'Study Rooms',
    desc: 'Quiet, well-lit rooms for exam season and group study.',
  },
  { icon: 'clean', title: 'Daily Housekeeping', desc: 'Rooms and common areas cleaned every day.' },
  {
    icon: 'water',
    title: 'Hot Water & RO',
    desc: 'Geysers and filtered drinking water available around the clock.',
  },
];

// Prices are per bed, per month (PKR). REPLACE with real rates.
export const rooms = [
  {
    id: 'single',
    category: 'private',
    name: 'Single Room',
    sleeps: 1,
    price: 25000,
    popular: false,
    blurb: 'Your own private space for focus and rest.',
    features: ['Attached bath', 'Study desk', 'AC / Heater', 'Wardrobe'],
    images: [
      img('photo-1631049307264-da0ec9d70304', 900),
      img('photo-1560448204-e02f11c3d0e2', 900),
    ],
  },
  {
    id: 'double',
    category: 'shared',
    name: 'Double Sharing',
    sleeps: 2,
    price: 15000,
    popular: true,
    blurb: 'Our most loved option — private enough, social enough.',
    features: ['Shared bath', 'Study desks', 'Fan / Heater', 'Lockers'],
    images: [
      img('photo-1618773928121-c32242e63f39', 900),
      img('photo-1522708323590-d24dbb6b0267', 900),
    ],
  },
  {
    id: 'triple',
    category: 'shared',
    name: 'Triple Sharing',
    sleeps: 3,
    price: 11000,
    popular: false,
    blurb: 'Great value for friends or classmates staying together.',
    features: ['Shared bath', 'Study corner', 'Fan', 'Lockers'],
    images: [
      img('photo-1590490360182-c33d57733427', 900),
      img('photo-1505693416388-ac5ce068fe85', 900),
    ],
  },
  {
    id: 'dorm',
    category: 'shared',
    name: 'Dormitory (6 beds)',
    sleeps: 6,
    price: 8000,
    popular: false,
    blurb: 'The most affordable way to live close to campus.',
    features: ['Bunk beds', 'Personal locker', 'Fan', 'Common bath'],
    images: [
      img('photo-1555854877-bab0e564b8d5', 900),
      img('photo-1505693416388-ac5ce068fe85', 900),
    ],
  },
];

export const meals = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    time: '7:00 – 9:30 AM',
    icon: 'sunrise',
    dishes: [
      {
        name: 'Paratha & Omelette',
        desc: 'Fresh paratha with a masala omelette and hot chai.',
        image: img('photo-1525351484163-7529414344d8', 700),
      },
      {
        name: 'Halwa Puri',
        desc: 'Weekend special served with chana and halwa.',
        image: img('photo-1567620905732-2d1ec7ab7445', 700),
      },
      {
        name: 'Daliya & Fruit',
        desc: 'A light, healthy start with seasonal fruit.',
        image: img('photo-1512621776951-a57141f2eefd', 700),
      },
    ],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    time: '1:00 – 3:00 PM',
    icon: 'sun',
    dishes: [
      {
        name: 'Chicken Karahi & Roti',
        desc: 'Rich, spicy karahi with fresh tandoori roti.',
        image: img('photo-1585937421612-70a008356fbe', 700),
      },
      {
        name: 'Daal Chawal',
        desc: 'Comforting daal with steamed rice and salad.',
        image: img('photo-1596797038530-2c107229654b', 700),
      },
      {
        name: 'Seasonal Sabzi',
        desc: 'A fresh vegetable dish cooked daily.',
        image: img('photo-1512621776951-a57141f2eefd', 700),
      },
    ],
  },
  {
    id: 'dinner',
    label: 'Dinner',
    time: '7:30 – 10:00 PM',
    icon: 'moon',
    dishes: [
      {
        name: 'Chicken Biryani',
        desc: 'Our Friday favourite with raita and salad.',
        image: img('photo-1631515243349-e0cb75fb8d3a', 700),
      },
      {
        name: 'BBQ Night',
        desc: 'Grilled tikka and kebabs once a week.',
        image: img('photo-1555939594-58d7cb561ad1', 700),
      },
      {
        name: 'Qeema & Naan',
        desc: 'Hearty minced-meat curry with naan.',
        image: img('photo-1504674900247-0877df9cc836', 700),
      },
    ],
  },
];

export const foodPerks = [
  'Hygienic kitchen',
  'Weekly rotating menu',
  'Friday biryani',
  'Vegetarian options',
  'Hot chai anytime',
];
export const marqueeDishes = [
  'Chicken Karahi',
  'Biryani',
  'Halwa Puri',
  'Daal Chawal',
  'Aloo Paratha',
  'Chapli Kabab',
  'Qeema Naan',
  'Chana Chaat',
  'Kheer',
  'Seekh Kabab',
  'Palak Paneer',
  'Chicken Pulao',
];

export const gallery = [
  {
    src: img('photo-1555854877-bab0e564b8d5', 1200),
    alt: 'Dormitory',
    className: 'md:col-span-2 md:row-span-2',
  },
  { src: img('photo-1481627834876-b7833e8f5570', 800), alt: 'Study room', className: '' },
  { src: img('photo-1525351484163-7529414344d8', 800), alt: 'Breakfast', className: '' },
  {
    src: img('photo-1522202176988-66273c2fd55f', 800),
    alt: 'Residents studying',
    className: 'md:row-span-2',
  },
  { src: img('photo-1497366216548-37526070297c', 800), alt: 'Common lounge', className: '' },
  {
    src: img('photo-1631049307264-da0ec9d70304', 1200),
    alt: 'Private room',
    className: 'md:col-span-2',
  },
];

// REPLACE with real resident reviews.
export const testimonials = [
  {
    quote:
      'The rooms are clean, the food tastes like home, and I never worry about my safety. Studying here has been a great experience.',
    name: 'Ahmed R.',
    role: 'Engineering student',
  },
  {
    quote:
      'Fast WiFi and a quiet study room made all the difference during my exams. The staff are always helpful.',
    name: 'Usman K.',
    role: 'Medical student',
  },
  {
    quote:
      'Affordable, close to campus and genuinely well managed. I recommended it to all my classmates.',
    name: 'Bilal S.',
    role: 'Business student',
  },
];

// REPLACE with real nearby landmarks and travel times.
export const landmarks = [
  { name: 'University Campus', time: '5 min' },
  { name: 'Main Market', time: '8 min' },
  { name: 'Hospital', time: '10 min' },
  { name: 'Bus Terminal', time: '12 min' },
];
