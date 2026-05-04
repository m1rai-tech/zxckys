import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Техніка',
    slug: 'electronics',
    icon: '📱',
    attributes: [
      { name: 'Стан', type: 'select', options: ['Новий', 'Вживаний', 'Після ремонту'], required: true },
      { name: 'Бренд', type: 'text', required: false },
      { name: 'Гарантія', type: 'select', options: ['Є', 'Немає'], required: false },
    ],
  },
  {
    id: 'auto',
    name: 'Авто',
    slug: 'auto',
    icon: '🚗',
    attributes: [
      { name: 'Рік випуску', type: 'number', required: true },
      { name: 'Пробіг', type: 'number', required: true },
      { name: 'Паливо', type: 'select', options: ['Бензин', 'Дизель', 'Електро', 'Гібрид', 'Газ'], required: true },
      { name: 'Коробка', type: 'select', options: ['Механіка', 'Автомат', 'Робот'], required: false },
    ],
  },
  {
    id: 'clothing',
    name: 'Одяг',
    slug: 'clothing',
    icon: '👕',
    attributes: [
      { name: 'Стан', type: 'select', options: ['Новий', 'Вживаний'], required: true },
      { name: 'Розмір', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
      { name: 'Бренд', type: 'text', required: false },
    ],
  },
  {
    id: 'work',
    name: 'Робота',
    slug: 'work',
    icon: '💼',
    attributes: [
      { name: 'Тип зайнятості', type: 'select', options: ['Повна', 'Часткова', 'Фріланс', 'Віддалена'], required: true },
      { name: 'Досвід', type: 'select', options: ['Без досвіду', '1-3 роки', '3-5 років', '5+ років'], required: false },
      { name: 'Зарплата', type: 'text', required: false },
    ],
  },
  {
    id: 'services',
    name: 'Послуги',
    slug: 'services',
    icon: '🔧',
    attributes: [
      { name: 'Тип послуги', type: 'text', required: true },
      { name: 'Виїзд', type: 'select', options: ['Так', 'Ні'], required: false },
    ],
  },
  {
    id: 'books',
    name: 'Конспекти/книги',
    slug: 'books',
    icon: '📚',
    attributes: [
      { name: 'Стан', type: 'select', options: ['Новий', 'Вживаний'], required: true },
      { name: 'Предмет', type: 'text', required: false },
    ],
  },
  {
    id: 'gaming',
    name: 'Геймінг',
    slug: 'gaming',
    icon: '🎮',
    attributes: [
      { name: 'Платформа', type: 'select', options: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'], required: true },
      { name: 'Стан', type: 'select', options: ['Новий', 'Вживаний'], required: true },
    ],
  },
  {
    id: 'free',
    name: 'Безкоштовно',
    slug: 'free',
    icon: '🎁',
    attributes: [
      { name: 'Стан', type: 'select', options: ['Новий', 'Вживаний'], required: false },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
