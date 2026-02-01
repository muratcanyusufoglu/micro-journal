import { BarcodeScanningResult, Camera, CameraView } from "expo-camera";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { IconButton } from "./IconButton";

interface QRScannerScreenProps {
  onScanned: (data: string) => void;
  onCancel: () => void;
}

export function QRScannerScreen({onScanned, onCancel}: QRScannerScreenProps) {
  const theme = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    async function requestPermission() {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    }

    requestPermission();
  }, []);

  function handleBarCodeScanned({data}: BarcodeScanningResult) {
    if (scanned) return;
    
    setScanned(true);
    onScanned(data);
  }

  if (hasPermission === null) {
    return (
      <View
        style={[
          $container,
          {backgroundColor: theme.colors.bgPrimary},
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
        <Text style={[textStyle, {color: theme.colors.text, marginTop: 16}]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={[
          $container,
          {backgroundColor: theme.colors.bgPrimary},
        ]}
      >
        <Text style={[textStyle, {color: theme.colors.text, marginBottom: 24}]}>
          Camera permission is required to scan QR codes.
        </Text>
        <Text style={[textStyle, {color: theme.colors.textMuted, fontSize: 14}]}>
          Please enable camera access in Settings.
        </Text>
        <Pressable
          style={[
            $button,
            {
              backgroundColor: theme.colors.textPrimary,
              marginTop: 24,
            },
          ]}
          onPress={onCancel}
        >
          <Text style={[textStyle, {color: theme.colors.bgPrimary}]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={$container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
      />

      {/* Overlay */}
      <View style={$overlay}>
        <View style={$header}>
          <IconButton
            icon="close"
            onPress={onCancel}
            style={$closeButton}
            size={32}
          />
        </View>

        <View style={$scanAreaContainer}>
          <View
            style={[
              $scanFrame,
              {borderColor: scanned ? theme.colors.textPrimary : "white"},
            ]}
          />
          <Text
            style={[
              textStyle,
              {
                color: "white",
                fontSize: 16,
                marginTop: 24,
                textAlign: "center",
              },
            ]}
          >
            {scanned ? "QR Code Scanned!" : "Point camera at QR code"}
          </Text>
        </View>

        <View style={$footer}>
          {scanned && (
            <Pressable
              style={[
                $button,
                {backgroundColor: theme.colors.textPrimary},
              ]}
              onPress={() => setScanned(false)}
            >
              <Text style={[textStyle, {color: theme.colors.bgPrimary}]}>Scan Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
};

const $overlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "space-between",
  alignItems: "center",
};

const $header: ViewStyle = {
  width: "100%",
  paddingTop: 60,
  paddingHorizontal: 16,
  flexDirection: "row",
  justifyContent: "flex-end",
};

const $closeButton: ViewStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  borderRadius: 20,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
};

const $scanAreaContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
};

const $scanFrame: ViewStyle = {
  width: 250,
  height: 250,
  borderWidth: 3,
  borderRadius: 16,
  backgroundColor: "transparent",
};

const $footer: ViewStyle = {
  width: "100%",
  paddingBottom: 60,
  paddingHorizontal: 24,
  alignItems: "center",
};

const $button: ViewStyle = {
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
  alignItems: "center",
  minWidth: 120,
};

const textStyle: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
};

type ViewStyle = object;
type TextStyle = object;
