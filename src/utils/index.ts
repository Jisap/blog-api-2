
export const genUsername = (email: string): string => {

  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2);
  const username = `${usernamePrefix}${randomChars}`;

  return username;
}

export const genSlug = (title: string): string => {

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, "-") // Reemplaza caracteres no permitidos por guiones
    .replace(/\s+/g, "-")          // Reemplaza espacios por guiones
    .replace(/-+/g, "-")           // Reemplaza múltiples guiones por uno solo

  const randomChars = Math.random().toString(36).slice(2); // Genera caracteres aleatorios
  const uniqueSlug = `${slug}-${randomChars}`;             // Combina el slug original con los caracteres aleatorios


  return uniqueSlug;
}