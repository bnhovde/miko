import "backpack.css";
import "styles/index.css";

import { EditorProvider } from "context/EditorContext";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EditorProvider>
      <Component {...pageProps} />
    </EditorProvider>
  );
}

export default MyApp;
