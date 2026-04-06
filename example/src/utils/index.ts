export const cn = (classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
