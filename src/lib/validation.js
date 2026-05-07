export const normalizePhone = (raw) => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('7') && !digits.startsWith('380')) return 'INVALID';
  if (digits.startsWith('380')) return '+' + digits;
  if (digits.startsWith('80')) return '+3' + digits;
  if (digits.startsWith('0')) return '+38' + digits;
  if (digits.length === 9) return '+380' + digits;
  return '+' + digits;
};

export const isValidUaPhone = (raw) => {
  const norm = normalizePhone(raw);
  if (norm === 'INVALID') return false;
  if (/^\+7\d/.test(norm)) return false;
  if (!/^\+380\d{9}$/.test(norm)) return false;
  const code = norm.slice(4, 6);
  const valid = ['39','50','63','66','67','68','73','91','92','93','94','95','96','97','98','99'];
  return valid.includes(code);
};

export const formatPhoneInput = (raw) => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('80')) digits = '3' + digits;
  if (digits.startsWith('0')) digits = '38' + digits;
  if (!digits.startsWith('380') && digits.length > 0) digits = '380' + digits;
  digits = digits.slice(0, 12);
  if (digits.length === 0) return '';
  let r = '+' + digits.slice(0, 3);
  if (digits.length > 3) r += ' ' + digits.slice(3, 5);
  if (digits.length > 5) r += ' ' + digits.slice(5, 8);
  if (digits.length > 8) r += ' ' + digits.slice(8, 10);
  if (digits.length > 10) r += ' ' + digits.slice(10, 12);
  return r;
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
