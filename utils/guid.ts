/**
 * guid generator
 *
 * @returns GUID
 */
const guid = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

export default guid;
