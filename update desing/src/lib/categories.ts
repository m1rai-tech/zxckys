import {
  IconLaptop, IconCar, IconShirt, IconBriefcase, IconWrench,
  IconBook, IconGamepad, IconGift, IconGrid
} from '../components/Icons';

export type Category = {
  slug: string;
  name: string;
  Icon: typeof IconLaptop;
  attrs: { key: string; label: string; type: 'text' | 'select'; options?: string[] }[];
};

export const CATEGORIES: Category[] = [
  {
    slug: 'tech', name: 'Техніка', Icon: IconLaptop,
    attrs: [
      { key: 'brand', label: 'Бренд', type: 'text' },
      { key: 'condition', label: 'Стан', type: 'select', options: ['Нове', 'Б/в'] },
    ],
  },
  {
    slug: 'auto', name: 'Авто', Icon: IconCar,
    attrs: [
      { key: 'brand', label: 'Марка', type: 'text' },
      { key: 'year', label: 'Рік', type: 'text' },
      { key: 'mileage', label: 'Пробіг (км)', type: 'text' },
    ],
  },
  {
    slug: 'clothes', name: 'Одяг', Icon: IconShirt,
    attrs: [
      { key: 'size', label: 'Розмір', type: 'text' },
      { key: 'gender', label: 'Стать', type: 'select', options: ['Чоловіча', 'Жіноча', 'Унісекс', 'Дитяча'] },
    ],
  },
  {
    slug: 'jobs', name: 'Робота', Icon: IconBriefcase,
    attrs: [
      { key: 'employment', label: 'Тип зайнятості', type: 'select', options: ['Повна', 'Часткова', 'Віддалено'] },
    ],
  },
  {
    slug: 'services', name: 'Послуги', Icon: IconWrench,
    attrs: [
      { key: 'experience', label: 'Досвід', type: 'text' },
    ],
  },
  {
    slug: 'books', name: 'Конспекти/книги', Icon: IconBook,
    attrs: [
      { key: 'subject', label: 'Предмет', type: 'text' },
    ],
  },
  {
    slug: 'gaming', name: 'Геймінг', Icon: IconGamepad,
    attrs: [
      { key: 'platform', label: 'Платформа', type: 'select', options: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
    ],
  },
  {
    slug: 'free', name: 'Безкоштовно', Icon: IconGift,
    attrs: [],
  },
];

export const getCategory = (slug?: string) => CATEGORIES.find(c => c.slug === slug);
export { IconGrid };
