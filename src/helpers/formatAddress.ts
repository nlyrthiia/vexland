export const normalizeAddress = (address: string) => address.toLowerCase();

export const formatTruncatedAddress = (address: string) => {
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}…${end}`;
};
