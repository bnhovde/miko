import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

import styles from "./Timeline.module.css";
import useKeyPressed from "hooks/useKey";
import Item from "./Item";
import useDrop from "hooks/useDrop";
import { useSpriteStore } from "src/stores/useSpriteStore";
import { useEditorStore } from "src/stores/useEditorStore";

const Timeline: React.FC = () => {
  const { currentSprite, addFrame, deleteFrame, reorderFrames } = useSpriteStore();
  const { currentFrame, setCurrentFrame } = useEditorStore();

  const dropRef = useRef<HTMLUListElement>(null);
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [draggedOverIndex, setDraggedOverIndex] = useState(-1);

  const onDrop = () => {
    reorderFrames(draggedIndex, draggedOverIndex);

    console.log(
      "draggedIndex, draggedOverIndex: ",
      draggedIndex,
      draggedOverIndex
    );
    onDragEnd();
  };

  const onDragEnd = () => {
    setDraggedIndex(-1);
    setDraggedOverIndex(-1);
  };

  const { isZoneActive } = useDrop({
    ref: dropRef,
    onDrop,
  });

  const cmdDown = useKeyPressed((ev: KeyboardEvent) => ev.metaKey);
  const shiftDown = useKeyPressed((ev: KeyboardEvent) => ev.shiftKey);

  const onlyOneFrame =
    currentSprite?.frames && currentSprite?.frames?.length < 2;

  const onFrameClickHandler = (frame: number) => {
    if (cmdDown) {
      addFrame(frame);
    } else if (shiftDown && !onlyOneFrame) {
      deleteFrame(frame);
    } else {
      setCurrentFrame(frame);
    }
  };

  const onAddFrameHandler = () => {
    addFrame(
      currentSprite?.frames?.length !== undefined
        ? currentSprite?.frames?.length - 1
        : 0
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <span className={styles.line} aria-hidden />
        <ul className={styles.timeline} ref={dropRef}>
          {currentSprite?.frames.map((f, i) => (
            <Item
              key={`${i}-${f}`}
              order={i}
              hash={f}
              palette={currentSprite?.palette || []}
              isActive={isZoneActive}
              isSelected={currentFrame === i}
              shiftDown={shiftDown}
              cmdDown={cmdDown}
              draggedIndex={draggedIndex}
              draggedOverIndex={draggedOverIndex}
              onDragStart={() => setDraggedIndex(i)}
              onDragOver={() => setDraggedOverIndex(i)}
              onDragEnd={onDragEnd}
              onClick={onFrameClickHandler}
            />
          ))}
          <li className={styles.item} data-empty>
            <button
              className={styles.button}
              onClick={() => onAddFrameHandler()}
            >
              <FiPlus />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
