import { COLORS_PALETTES } from "@/constants/CColors.js";

export const getRandomColorPalette = (): string[] => {
    const randomIndex = Math.floor(Math.random() * COLORS_PALETTES.length);
    return COLORS_PALETTES[randomIndex];
};
