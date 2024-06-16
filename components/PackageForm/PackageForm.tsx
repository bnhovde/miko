import React, { useContext } from "react";
import classNames from "classnames";

import styles from "./PackageForm.module.css";
import EditorContext from "context/EditorContext";
import { useRouter } from "next/router";

const PackageForm: React.FC = () => {
  const router = useRouter();
  const { state, onUpdatePackage } = useContext(EditorContext);

  const [name, setName] = React.useState(
    state?.packageData?.name || "New Package"
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!state.packageData) return;

    event.preventDefault();
    const newPackage = {
      ...state.packageData,
      name,
    };

    onUpdatePackage(newPackage);

    router.push(
      router.query.packageId
        ? `/app/editor/package/${router.query.packageId}`
        : `/app/editor/package`
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

export default PackageForm;
