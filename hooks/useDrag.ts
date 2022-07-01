import { useState, RefObject, useEffect } from 'react';

type Props<T extends HTMLElement = HTMLElement> = {
  ref: RefObject<T>;
  order: number;
  onDragStart?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragEnd?: () => void;
};

const useDrag = ({ order, ref, onDragStart, onDragOver, onDragEnd }: Props) => {
  const [dragState, updateDragState] = useState('passive');

  const dragStartCb = (event: DragEvent) => {
    updateDragState('start');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer?.setData('source', String(order));
    }
    onDragStart && onDragStart(event);
  };

  const dragOverCb = (event: DragEvent) => {
    updateDragState('dragging');
    onDragOver && onDragOver(event);
  };

  const dragEndCb = (event: DragEvent) => {
    updateDragState('passive');
    onDragEnd && onDragEnd();
  };

  useEffect(() => {
    const elem = ref?.current;
    if (elem) {
      elem.setAttribute('draggable', 'true');
      elem.addEventListener('dragstart', dragStartCb);
      elem.addEventListener('dragover', dragOverCb);
      elem.addEventListener('dragend', dragEndCb);
      return () => {
        elem.removeEventListener('dragstart', dragStartCb);
        elem.removeEventListener('dragover', dragOverCb);
        elem.removeEventListener('dragend', dragEndCb);
      };
    }
  }, []);
  return {
    dragState: dragState,
  };
};

export default useDrag;
