import {
  IconLaptop, IconCar, IconShirt, IconBriefcase, IconWrench,
  IconBook, IconGamepad, IconGift, IconGrid
} from '../components/Icons';

export const CATEGORIES = [
  {
    slug: 'tech', name: 'Техніка', Icon: IconLaptop,
    attrs: [
      { key: 'type', label: 'Тип техніки', type: 'select', filter: 'select',
        options: ['Смартфон', 'Ноутбук', 'Планшет', 'ПК', 'Телевізор', 'Фотоапарат', 'Навушники', 'Розумний годинник', 'Ігрова консоль', 'Інше'] },
      { key: 'brand', label: 'Бренд', type: 'text', filter: 'text', placeholder: 'Apple, Samsung...' },
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Нове', 'Б/в — відмінний', 'Б/в — гарний', 'Б/в — задовільний'] },
      { key: 'warranty', label: 'Гарантія', type: 'select', filter: 'select',
        options: ['Є', 'Немає'] },
    ],
  },
  {
    slug: 'auto', name: 'Авто', Icon: IconCar,
    attrs: [
      { key: 'brand', label: 'Марка', type: 'select', filter: 'select',
        options: ['Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Opel', 'Ford', 'Renault', 'Skoda', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Peugeot', 'Chevrolet', 'Subaru', 'Volvo', 'LADA', 'ЗАЗ', 'Інша'] },
      { key: 'model', label: 'Модель', type: 'text', filter: 'text', placeholder: 'Corolla, Golf...' },
      { key: 'year', label: 'Рік випуску', type: 'text', filter: 'range', placeholder: 'наприклад: 2018' },
      { key: 'mileage', label: 'Пробіг (км)', type: 'text', filter: 'range', placeholder: 'наприклад: 120000' },
      { key: 'fuel', label: 'Паливо', type: 'select', filter: 'select',
        options: ['Бензин', 'Дизель', 'Електро', 'Гібрид', 'Газ/Бензин'] },
      { key: 'transmission', label: 'Коробка передач', type: 'select', filter: 'select',
        options: ['Механіка', 'Автомат', 'Варіатор', 'Робот'] },
      { key: 'body', label: 'Тип кузова', type: 'select', filter: 'select',
        options: ['Седан', 'Хетчбек', 'Позашляховик', 'Мінівен', 'Купе', 'Кабріолет', 'Пікап', 'Мікроавтобус'] },
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Відмінний', 'Гарний', 'Потребує ремонту'] },
    ],
  },
  {
    slug: 'clothes', name: 'Одяг', Icon: IconShirt,
    attrs: [
      { key: 'gender', label: 'Стать', type: 'select', filter: 'select',
        options: ['Чоловіча', 'Жіноча', 'Унісекс', 'Дитяча'] },
      { key: 'clothing_type', label: 'Тип одягу', type: 'select', filter: 'select',
        options: ['Верхній одяг', 'Сорочки / Блузи', 'Штани / Джинси', 'Сукні / Спідниці', 'Взуття', 'Аксесуари', 'Спортивний', 'Нижня білизна', 'Інше'] },
      { key: 'size', label: 'Розмір', type: 'select', filter: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'brand', label: 'Бренд', type: 'text', filter: 'text', placeholder: 'Zara, Nike...' },
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Нове з тегами', 'Нове без тегів', 'Б/в — відмінний', 'Б/в — гарний'] },
      { key: 'season', label: 'Сезон', type: 'select', filter: 'select',
        options: ['Літо', 'Зима', 'Весна/Осінь', 'Всесезонне'] },
    ],
  },
  {
    slug: 'jobs', name: 'Робота', Icon: IconBriefcase,
    attrs: [
      { key: 'employment', label: 'Тип зайнятості', type: 'select', filter: 'select',
        options: ['Повна зайнятість', 'Часткова зайнятість', 'Фріланс', 'Стажування', 'Вахтовий метод'] },
      { key: 'experience', label: 'Досвід', type: 'select', filter: 'select',
        options: ['Без досвіду', 'до 1 року', '1–3 роки', '3–5 років', '5+ років'] },
      { key: 'schedule', label: 'Графік', type: 'select', filter: 'select',
        options: ['Повний день', 'Вільний графік', 'Змінний', 'Дистанційно'] },
      { key: 'industry', label: 'Галузь', type: 'select', filter: 'select',
        options: ['IT / Технології', 'Освіта', 'Медицина', 'Торгівля', 'Транспорт', 'Виробництво', 'Будівництво', 'Фінанси', 'Сфера послуг', 'Інше'] },
    ],
  },
  {
    slug: 'services', name: 'Послуги', Icon: IconWrench,
    attrs: [
      { key: 'service_type', label: 'Тип послуги', type: 'select', filter: 'select',
        options: ['Ремонт / Будівництво', "Краса / Здоров'я", 'Навчання / Репетиторство', 'IT / Технології', 'Транспорт / Доставка', 'Фото / Відео', 'Юридичні', 'Клінінг', 'Дизайн', 'Інше'] },
      { key: 'onsite', label: 'Виїзд', type: 'select', filter: 'select',
        options: ['Виїзд є', 'Без виїзду'] },
      { key: 'experience', label: 'Досвід', type: 'select', filter: 'select',
        options: ['до 1 року', '1–3 роки', '3–5 років', '5+ років'] },
    ],
  },
  {
    slug: 'books', name: 'Конспекти/книги', Icon: IconBook,
    attrs: [
      { key: 'book_type', label: 'Тип', type: 'select', filter: 'select',
        options: ['Підручник', 'Конспект', 'Задачник', 'Художня', 'Наукова', 'Словник', 'Інше'] },
      { key: 'subject', label: 'Предмет / Назва', type: 'text', filter: 'text', placeholder: 'Математика, Фізика...' },
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Нові', 'Б/в — гарний', 'Б/в — задовільний'] },
      { key: 'language', label: 'Мова', type: 'select', filter: 'select',
        options: ['Українська', 'Англійська', 'Польська', 'Інша'] },
    ],
  },
  {
    slug: 'gaming', name: 'Геймінг', Icon: IconGamepad,
    attrs: [
      { key: 'platform', label: 'Платформа', type: 'select', filter: 'select',
        options: ['PC', 'PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile', 'Інше'] },
      { key: 'gaming_type', label: 'Тип', type: 'select', filter: 'select',
        options: ['Гра', 'Консоль', 'Контролер', 'Аксесуар', 'Обліковий запис', 'Інше'] },
      { key: 'genre', label: 'Жанр', type: 'select', filter: 'select',
        options: ['Екшн', 'RPG', 'Стратегія', 'Спорт', 'Шутер', 'Пригоди', 'Симулятор', 'Гоночні', 'Головоломки', 'Інше'] },
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Нове', 'Б/в — відмінний', 'Б/в — гарний'] },
    ],
  },
  {
    slug: 'free', name: 'Безкоштовно', Icon: IconGift,
    attrs: [
      { key: 'condition', label: 'Стан', type: 'select', filter: 'select',
        options: ['Нове', 'Б/в — відмінний', 'Б/в — гарний', 'Б/в — задовільний'] },
      { key: 'free_type', label: 'Тип', type: 'text', filter: 'text', placeholder: 'Що саме?' },
    ],
  },
];

export const getCategory = (slug) => CATEGORIES.find(c => c.slug === slug);
export { IconGrid };
