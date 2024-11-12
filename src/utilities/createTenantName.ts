export const createName = (name: string) => {
  const milliSeconds = Date.now().toString(36);
  const firstName = name.split(' ')[0].slice(5);

  return firstName.toLowerCase() + milliSeconds;
};
