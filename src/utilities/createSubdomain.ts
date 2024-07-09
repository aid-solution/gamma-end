const removeAccent = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const removeSpecialCharater = (str: string) => {
  return str.replace(/[^a-zA-Z0-9 ]/g, '');
};

const replaceSpaveWithDash = (str: string) => {
  return str.split(' ').join('-');
};

export const createSubdomain = (denomination: string) => {
  const withoutAccent = removeAccent(denomination);
  const withoutSpecialCharacter = removeSpecialCharater(withoutAccent).trim();
  const withDash = replaceSpaveWithDash(
    withoutSpecialCharacter,
  ).toLocaleLowerCase();
  return withDash;
};
