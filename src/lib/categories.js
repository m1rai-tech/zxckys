import {
  IconLaptop, IconCar, IconShirt, IconBriefcase, IconWrench,
  IconBook, IconGamepad, IconGift, IconGrid
} from '../components/Icons';

export const CATEGORIES = [
  {
    slug: 'tech', name: 'Техніка', Icon: IconLaptop,
    attrs: [
      { key: 'subcategory', label: 'Підкатегорія', type: 'select', filterable: true,
        options: ['Телефони та смартфони', 'Ноутбуки', "Комп'ютери", 'Планшети', 'Телевізори', 'Фото і відео', 'Аудіотехніка', 'Ігрові консолі', 'Комплектуючі', 'Аксесуари', 'Побутова техніка', 'Інше'] },
      { key: 'brand', label: 'Бренд', type: 'text', filterable: true },
      { key: 'model', label: 'Модель', type: 'text' },
      { key: 'condition', label: 'Стан', type: 'select', filterable: true, options: ['Нове', 'Б/в', 'Відновлене'] },
    ],
  },
  {
    slug: 'auto', name: 'Авто', Icon: IconCar,
    attrs: [
      { key: 'make',      label: 'Марка',          type: 'auto-make', filterable: true },
      { key: 'model',     label: 'Модель',          type: 'auto-model', filterable: true },
      { key: 'body',      label: 'Тип кузова',      type: 'auto-body', filterable: true },
      { key: 'year',      label: 'Рік випуску',     type: 'number', filterable: true, filterType: 'range' },
      { key: 'mileage',   label: 'Пробіг (тис. км)', type: 'number' },
      { key: 'fuel',      label: 'Паливо',          type: 'select', filterable: true,
        options: ['Бензин', 'Дизель', 'Газ / Метан', 'Газ / Пропан', 'Електро', 'Гібрид'] },
      { key: 'gearbox',   label: 'КПП',             type: 'select', filterable: true,
        options: ['Механіка', 'Автомат', 'Варіатор', 'Робот'] },
      { key: 'drive',     label: 'Привід',          type: 'select', filterable: true,
        options: ['Передній', 'Задній', 'Повний'] },
      { key: 'color',     label: 'Колір',           type: 'text' },
      { key: 'condition', label: 'Стан',            type: 'select', filterable: true,
        options: ['Нове', 'Б/в', 'Після ДТП'] },
    ],
  },
  {
    slug: 'clothes', name: 'Одяг', Icon: IconShirt,
    attrs: [
      { key: 'subcategory', label: 'Тип одягу', type: 'select', filterable: true,
        options: ['Верхній одяг', 'Светри та худі', 'Футболки та поло', 'Штани та джинси', 'Сукні та спідниці', 'Взуття', 'Аксесуари', 'Спортивний одяг', 'Нижня білизна', 'Дитячий одяг', 'Інше'] },
      { key: 'gender', label: 'Стать', type: 'select', filterable: true,
        options: ['Чоловіча', 'Жіноча', 'Унісекс', 'Дитяча'] },
      { key: 'size',  label: 'Розмір', type: 'text', filterable: true },
      { key: 'brand', label: 'Бренд',  type: 'text', filterable: true },
      { key: 'color', label: 'Колір',  type: 'text' },
      { key: 'condition', label: 'Стан', type: 'select', filterable: true,
        options: ['Нове з бірками', 'Нове', 'Б/в — відмінний стан', 'Б/в'] },
    ],
  },
  {
    slug: 'jobs', name: 'Робота', Icon: IconBriefcase,
    attrs: [
      { key: 'field', label: 'Сфера', type: 'text', filterable: true },
      { key: 'employment', label: 'Зайнятість', type: 'select', filterable: true,
        options: ['Повна зайнятість', 'Часткова зайнятість', 'Віддалено', 'Фріланс', 'Стажування'] },
      { key: 'schedule', label: 'Графік', type: 'select', filterable: true,
        options: ['Повний день', 'Змінний графік', 'Гнучкий', 'Вахта'] },
      { key: 'experience', label: 'Досвід', type: 'select', filterable: true,
        options: ['Без досвіду', '1–2 роки', '2–5 років', '5+ років'] },
    ],
  },
  {
    slug: 'services', name: 'Послуги', Icon: IconWrench,
    attrs: [
      { key: 'subcategory', label: 'Тип послуги', type: 'select', filterable: true,
        options: ['Ремонт техніки', 'Будівництво та ремонт', 'Прибирання', 'Репетиторство', "Краса та здоров'я", 'Транспорт та переїзд', 'Юридичні послуги', 'Фото та відео', 'IT та інтернет', 'Дизайн', 'Бухгалтерія', 'Інше'] },
      { key: 'experience', label: 'Досвід', type: 'select', filterable: true,
        options: ['До 1 року', '1–3 роки', '3–5 років', '5+ років'] },
    ],
  },
  {
    slug: 'books', name: 'Конспекти/книги', Icon: IconBook,
    attrs: [
      { key: 'type', label: 'Тип', type: 'select', filterable: true,
        options: ['Підручник', 'Конспект', 'Навчальний посібник', 'Художня книга', 'Наукова книга', 'Журнал', 'Інше'] },
      { key: 'subject', label: 'Предмет / назва', type: 'text' },
      { key: 'language', label: 'Мова', type: 'select', filterable: true,
        options: ['Українська', 'Англійська', 'Інша'] },
      { key: 'condition', label: 'Стан', type: 'select', filterable: true,
        options: ['Нове', 'Б/в — відмінний стан', 'Б/в'] },
    ],
  },
  {
    slug: 'gaming', name: 'Геймінг', Icon: IconGamepad,
    attrs: [
      { key: 'subcategory', label: 'Тип', type: 'select', filterable: true,
        options: ['Гра', 'Консоль', 'Аксесуар', 'Комплектуючі для PC'] },
      { key: 'platform', label: 'Платформа', type: 'select', filterable: true,
        options: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'Mobile', 'Ретро', 'Інше'] },
      { key: 'genre', label: 'Жанр', type: 'select', filterable: false,
        options: ['Екшн', 'РПГ', 'Стратегія', 'Спорт', 'Гонки', 'Шутер', 'Пригоди', 'Хоррор', 'Симулятор', 'Інше'] },
      { key: 'condition', label: 'Стан', type: 'select', filterable: true,
        options: ['Нове', 'Б/в'] },
    ],
  },
  {
    slug: 'free', name: 'Безкоштовно', Icon: IconGift,
    attrs: [
      { key: 'subcategory', label: 'Тип', type: 'select', filterable: true,
        options: ['Речі та меблі', 'Техніка', 'Одяг', 'Книги', 'Рослини', 'Тварини', 'Їжа', 'Інше'] },
      { key: 'condition', label: 'Стан', type: 'select', filterable: false,
        options: ['Нове', 'Б/в'] },
    ],
  },
];

export const getCategory = (slug) => CATEGORIES.find(c => c.slug === slug);
export { IconGrid };
