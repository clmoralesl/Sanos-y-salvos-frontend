export const formatRut = (value) => {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (clean.length <= 1) return clean;
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

export const stripPhonePrefix = (phone) =>
  phone ? phone.replace(/^\+56/, '') : '';

export const buildPhone = (digits) =>
  digits.length > 0 ? `+56${digits}` : '';

export const filterPhoneDigits = (value) =>
  value.replace(/\D/g, '').slice(0, 9);
