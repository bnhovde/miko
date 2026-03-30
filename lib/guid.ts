/** Generates a short random ID prefixed with "_". */
const guid = (): string => `_${Math.random().toString(36).substring(2, 11)}`;

export default guid;
