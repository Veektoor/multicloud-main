const NAIROBI_TIME_ZONE = 'Africa/Nairobi';
const DEFAULT_LOCALE = 'en-KE';

const toDate = (value?: string | number | Date | null) => {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const formatNairobiDateTime = (
  value?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  const date = toDate(value);
  if (!date) return 'No date';

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: NAIROBI_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatNairobiDate = (
  value?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  const date = toDate(value);
  if (!date) return 'No date';

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    dateStyle: 'full',
    timeZone: NAIROBI_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatNairobiTime = (
  value?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  const date = toDate(value);
  if (!date) return 'No time';

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: NAIROBI_TIME_ZONE,
    ...options,
  }).format(date);
};

export { NAIROBI_TIME_ZONE };
