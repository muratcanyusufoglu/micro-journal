import {useEffect} from "react";
import * as Linking from "expo-linking";
import {router} from "expo-router";

export function useDeepLinking() {
  useEffect(() => {
    function handleInitialURL(url: string) {
      const {path, hostname, queryParams} = Linking.parse(url);

      // For URLs like oneline://capture, expo-linking may put "capture" in hostname instead of path.
      const route = path || hostname || "";

      if (route === "quick-capture") {
        const text = queryParams?.text as string | undefined;
        if (text) {
          router.push({
            pathname: "/quick-capture",
            params: {text: decodeURIComponent(text)},
          });
        } else {
          router.push("/quick-capture");
        }
      } else if (route === "capture") {
        router.push({
          pathname: "/capture",
          params: queryParams as Record<string, string>,
        });
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleInitialURL(url);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleInitialURL(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
