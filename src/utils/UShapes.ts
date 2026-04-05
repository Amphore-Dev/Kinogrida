import { SHAPES_TYPES } from "@/constants/index.js";

export const getRandomShapeType = () => {
    const shapeTypes = Object.keys(
        SHAPES_TYPES,
    ) as (keyof typeof SHAPES_TYPES)[];
    const randomIndex = Math.floor(Math.random() * shapeTypes.length);
    return SHAPES_TYPES[shapeTypes[randomIndex]];
};
