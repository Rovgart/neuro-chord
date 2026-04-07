export const protectEmail = (email: string | null | undefined) => {
  if (!email || !email.includes('@')) return '********';

  const [localPart, domain] = email.split('@');

  if (localPart.length < 2) {
    return `*****@${domain}`;
  }

  return `${localPart[0]}****@${domain}`;
};
