export function insertAtIndex<T>(arr: T[], index: number, newItem: T) {
  return [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index),
  ];
}

export function moveToIndex<T>(arr: T[], from: number, to: number) {
  const newArr = [...arr];
  const item = newArr.splice(from, 1)[0];
  newArr.splice(to, 0, item);
  return newArr;
}
