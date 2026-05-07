import {
  MagnifyingGlassIcon, HeartIcon as HeartOutline, ChatBubbleLeftRightIcon,
  UserIcon, PlusIcon, ArrowRightOnRectangleIcon, XMarkIcon, ChevronDownIcon,
  MapPinIcon, StarIcon as StarOutline, CalendarDaysIcon, PhoneIcon, PhotoIcon,
  PaperAirplaneIcon, TrashIcon, PencilIcon, CheckIcon, HomeIcon, Cog6ToothIcon,
  ComputerDesktopIcon, TruckIcon, ShoppingBagIcon, BriefcaseIcon,
  WrenchScrewdriverIcon, BookOpenIcon, PuzzlePieceIcon, GiftIcon, Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

const w = (Comp) => ({ size = 20, className }) => <Comp width={size} height={size} className={className}/>;

export const IconSearch = w(MagnifyingGlassIcon);
export const IconHeart = ({ size = 20, fill, className }) =>
  fill ? <HeartSolid width={size} height={size} className={className}/> : <HeartOutline width={size} height={size} className={className}/>;
export const IconMessage = w(ChatBubbleLeftRightIcon);
export const IconUser = w(UserIcon);
export const IconPlus = w(PlusIcon);
export const IconLogout = w(ArrowRightOnRectangleIcon);
export const IconClose = w(XMarkIcon);
export const IconChevronDown = w(ChevronDownIcon);
export const IconLocation = w(MapPinIcon);
export const IconStar = ({ size = 16, fill, className }) =>
  fill ? <StarSolid width={size} height={size} className={className}/> : <StarOutline width={size} height={size} className={className}/>;
export const IconCalendar = w(CalendarDaysIcon);
export const IconPhone = w(PhoneIcon);
export const IconImage = w(PhotoIcon);
export const IconSend = w(PaperAirplaneIcon);
export const IconTrash = w(TrashIcon);
export const IconEdit = w(PencilIcon);
export const IconCheck = w(CheckIcon);
export const IconHome = w(HomeIcon);
export const IconSettings = w(Cog6ToothIcon);
export const IconLaptop = w(ComputerDesktopIcon);
export const IconCar = w(TruckIcon);
export const IconShirt = w(ShoppingBagIcon);
export const IconBriefcase = w(BriefcaseIcon);
export const IconWrench = w(WrenchScrewdriverIcon);
export const IconBook = w(BookOpenIcon);
export const IconGamepad = w(PuzzlePieceIcon);
export const IconGift = w(GiftIcon);
export const IconGrid = w(Squares2X2Icon);
