/**
 * Generic array utility functions.
 */

/** Inserts an item at the given index, shifting subsequent items right. */
export const insertAtIndex = <T>(arr: T[], index: number, newItem: T): T[] => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];

/** Moves an item from `from` to `to`, returning a new array. */
export const moveToIndex = <T>(arr: T[], from: number, to: number): T[] => {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  if (item !== undefined) result.splice(to, 0, item);
  return result;
};
