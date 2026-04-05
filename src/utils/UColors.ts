import { COLORS_PALETTES } from "@/constants/CColors.js";

export const getRandomColorPalette = (): string[] => {
    const randomIndex = Math.floor(Math.random() * COLORS_PALETTES.length);
    return COLORS_PALETTES[randomIndex];
};

export const hexToRGBA = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
