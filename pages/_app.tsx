import "backpack.css";
import "styles/index.css";

import { EditorProvider } from "../src/providers/EditorProvider";
import { outlineWatcher } from "utils/a11y";

import type { AppProps } from "next/app";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    outlineWatcher();
  }, []);

  return (
    <EditorProvider>
      <Component {...pageProps} />
    </EditorProvider>
  );
}

export default MyApp;
