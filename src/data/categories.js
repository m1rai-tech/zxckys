export const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    attributes: [
      { name: 'Condition', type: 'select', options: ['New', 'Used', 'Refurbished'], required: true },
      { name: 'Brand', type: 'text', required: false },
      { name: 'Warranty', type: 'select', options: ['Yes', 'No'], required: false },
    ],
  },
  {
    id: 'auto',
    name: 'Vehicles',
    slug: 'auto',
    icon: '🚗',
    attributes: [
      { name: 'Year', type: 'number', required: true },
      { name: 'Mileage', type: 'number', required: true },
      { name: 'Fuel', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Gas'], required: true },
      { name: 'Transmission', type: 'select', options: ['Manual', 'Automatic', 'Robot'], required: false },
    ],
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    icon: '👕',
    attributes: [
      { name: 'Condition', type: 'select', options: ['New', 'Used'], required: true },
      { name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
      { name: 'Brand', type: 'text', required: false },
    ],
  },
  {
    id: 'work',
    name: 'Jobs',
    slug: 'work',
    icon: '💼',
    attributes: [
      { name: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Freelance', 'Remote'], required: true },
      { name: 'Experience', type: 'select', options: ['No experience', '1-3 years', '3-5 years', '5+ years'], required: false },
      { name: 'Salary', type: 'text', required: false },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    icon: '🔧',
    attributes: [
      { name: 'Service Type', type: 'text', required: true },
      { name: 'On-site', type: 'select', options: ['Yes', 'No'], required: false },
    ],
  },
  {
    id: 'books',
    name: 'Notes/Books',
    slug: 'books',
    icon: '📚',
    attributes: [
      { name: 'Condition', type: 'select', options: ['New', 'Used'], required: true },
      { name: 'Subject', type: 'text', required: false },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming',
    icon: '🎮',
    attributes: [
      { name: 'Platform', type: 'select', options: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'], required: true },
      { name: 'Condition', type: 'select', options: ['New', 'Used'], required: true },
    ],
  },
  {
    id: 'free',
    name: 'Free',
    slug: 'free',
    icon: '🎁',
    attributes: [
      { name: 'Condition', type: 'select', options: ['New', 'Used'], required: false },
    ],
  },
];

export function getCategoryById(id) {
  return categories.find(c => c.id === id);
}

export function getCategoryBySlug(slug) {
  return categories.find(c => c.slug === slug);
}
