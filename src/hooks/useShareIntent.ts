import {useEffect} from "react";
import {Platform} from "react-native";
import * as Linking from "expo-linking";
import {router} from "expo-router";
import * as FileSystem from "expo-file-system";
import type {ShareData} from "../data/types";

export function useShareIntent() {
  useEffect(() => {
    async function handleShareIntent() {
      const url = await Linking.getInitialURL();
      if (!url) return;

      const {scheme, host, queryParams} = Linking.parse(url);

      if (scheme === "oneline" && host === "capture") {
        await processShareData(queryParams as Record<string, string>);
        return;
      }

      if (Platform.OS === "android") {
        const intent = await Linking.getInitialURL();
        if (intent) {
          await processAndroidIntent(intent);
        }
      }
    }

    handleShareIntent();

    const subscription = Linking.addEventListener("url", async (event) => {
      const {scheme, host, queryParams} = Linking.parse(event.url);

      if (scheme === "oneline" && host === "capture") {
        await processShareData(queryParams as Record<string, string>);
      } else if (Platform.OS === "android") {
        await processAndroidIntent(event.url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

async function processShareData(params: Record<string, string>) {
  const shareData: Partial<ShareData> = {};

  if (params.text) {
    shareData.text = decodeURIComponent(params.text);
    shareData.type = "text";
  }

  if (params.url) {
    shareData.url = decodeURIComponent(params.url);
    shareData.type = "url";
  }

  if (params.imageUri) {
    shareData.imageUri = decodeURIComponent(params.imageUri);
    shareData.type = "image";
  }

  if (params.imageUris) {
    shareData.imageUris = decodeURIComponent(params.imageUris)
      .split(",")
      .map((uri) => decodeURIComponent(uri));
    shareData.type = "image";
  }

  if (shareData.type) {
    router.push({
      pathname: "/capture",
      params: params,
    });
  }
}

async function processAndroidIntent(url: string) {
  const {queryParams} = Linking.parse(url);

  const params: Record<string, string> = {};

  if (queryParams?.text) {
    params.text = queryParams.text as string;
  }

  if (queryParams?.url) {
    params.url = queryParams.url as string;
  }

  if (queryParams?.imageUri) {
    const imageUri = queryParams.imageUri as string;
    const localUri = await copyToLocalStorage(imageUri);
    if (localUri) {
      params.imageUri = localUri;
    }
  }

  if (queryParams?.imageUris) {
    const imageUris = (queryParams.imageUris as string).split(",");
    const localUris: string[] = [];

    for (const uri of imageUris) {
      const localUri = await copyToLocalStorage(uri);
      if (localUri) {
        localUris.push(localUri);
      }
    }

    if (localUris.length > 0) {
      params.imageUris = localUris.join(",");
    }
  }

  if (Object.keys(params).length > 0) {
    router.push({
      pathname: "/capture",
      params,
    });
  }
}

async function copyToLocalStorage(uri: string): Promise<string | null> {
  try {
    const filename = uri.split("/").pop() || `share_${Date.now()}.jpg`;
    const destUri = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.copyAsync({
      from: uri,
      to: destUri,
    });

    return destUri;
  } catch (error) {
    console.error("Error copying shared file:", error);
    return null;
  }
}
