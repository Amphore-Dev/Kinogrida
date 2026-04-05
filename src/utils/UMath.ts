export const random = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

// clamp angle between 0 and 2 * PI, if angle is negative, subtract it from 2 * PI
export const clampAngle = (angle: number): number => {
    const twoPi = Math.PI * 2;
    return ((angle % twoPi) + twoPi) % twoPi;
};
