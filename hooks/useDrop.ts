import { useState, useEffect, RefObject } from 'react';

type Props<T extends HTMLElement = HTMLElement> = {
  ref: RefObject<T>;
  onDrop: (source?: string) => void;
};

const useDrop = ({ ref, onDrop }: Props) => {
  const [isZoneActive, setZoneActive] = useState(false);

  const dragOverCb = (event: DragEvent) => {
    event.preventDefault();
    setZoneActive(true);
  };

  const dropCb = (event: DragEvent) => {
    event.preventDefault();
    onDrop(event.dataTransfer?.getData('source'));
    setZoneActive(false);
  };
  useEffect(() => {
    const elem = ref?.current;
    if (elem) {
      elem.addEventListener('dragover', dragOverCb);
      elem.addEventListener('drop', dropCb);
      return () => {
        elem.removeEventListener('dragover', dragOverCb);
        elem.removeEventListener('drop', dropCb);
      };
    }
  });
  return {
    isZoneActive,
  };
};

export default useDrop;
