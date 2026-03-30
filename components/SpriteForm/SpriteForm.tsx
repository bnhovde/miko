import React, { useContext } from "react";
import classNames from "classnames";

import styles from "./SpriteForm.module.css";
import EditorContext from "context/EditorContext";
import { useRouter } from "next/router";

const SpriteForm: React.FC = () => {
  const router = useRouter();
  const { state, onChangeName, onChangeSize } = useContext(EditorContext);

  const [name, setName] = React.useState(
    state?.spriteData?.name || "New Sprite"
  );
  const [fps, setFps] = React.useState(state?.spriteData?.fps || 10);
  const [size, setSize] = React.useState(state?.spriteData?.size || 11);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChangeName(name);
    if (size !== state?.spriteData?.size) {
      onChangeSize(size);
    }

    router.push(
      router.query.spriteId
        ? `/app/editor/sprite/${router.query.spriteId}`
        : `/app/editor/sprite`
    );
  };

  const formClass = classNames({
    [styles["form"]]: true,
  });

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Grid size:
        <input
          type="number"
          value={size}
          min={4}
          max={64}
          onChange={(e) => setSize(parseInt(e.target.value))}
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export default SpriteForm;
