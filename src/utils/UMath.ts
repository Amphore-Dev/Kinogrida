export const random = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};
