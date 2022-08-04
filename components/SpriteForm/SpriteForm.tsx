import React, { useContext } from "react";
import classNames from "classnames";

import styles from "./SpriteForm.module.css";
import EditorContext from "context/EditorContext";
import { useRouter } from "next/router";

const SpriteForm: React.FC = () => {
  const router = useRouter();
  const { state, onChangeName } = useContext(EditorContext);

  const [name, setName] = React.useState(
    state?.spriteData?.name || "New Sprite"
  );
  const [fps, setFps] = React.useState(state?.spriteData?.fps || 10);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onChangeName(name);

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
      {/* <label>
        FPS:
        <input
          type="number"
          value={fps}
          onChange={(e) => setFps(parseInt(e.target.value))}
        />
      </label> */}
      <input type="submit" value="Submit" />
    </form>
  );
};

export default SpriteForm;
