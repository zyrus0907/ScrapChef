import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { lookupBarcode } from '../../api/barcode';
import { Button } from '../../components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export const ScanScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [looking, setLooking] = useState(false);
  const lockRef = useRef(false);

  const goToAdd = (prefill: any) => navigation.replace('AddItem', { prefill });

  const onScanned = async ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setLooking(true);
    const product = await lookupBarcode(data);
    setLooking(false);
    goToAdd({
      barcode: data,
      name: product?.name ?? '',
      category: product?.category,
      imageUrl: product?.imageUrl,
      brand: product?.brand,
    });
  };

  // Barcode scanning needs a native camera — not reliable on web.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.bigEmoji}>📷</Text>
        <Text style={styles.title}>Scan on your phone</Text>
        <Text style={styles.message}>
          Barcode scanning uses the camera and works in the mobile app. You can still add items by hand.
        </Text>
        <Button label="Add Manually" onPress={() => navigation.replace('AddItem')} />
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.bigEmoji}>📷</Text>
        <Text style={styles.title}>Camera access</Text>
        <Text style={styles.message}>
          Allow camera access to scan grocery barcodes and add them to your pantry automatically.
        </Text>
        <Button label="Allow Camera" onPress={requestPermission} />
        <Pressable onPress={() => navigation.replace('AddItem')} style={styles.linkBtn}>
          <Text style={styles.link}>Add manually instead</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={looking ? undefined : onScanned}
      />

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>
          {looking ? 'Looking up product…' : 'Point at a barcode'}
        </Text>
      </View>

      {looking ? (
        <View style={styles.lookingBar}>
          <ActivityIndicator color={Colors.onPrimary} />
          <Text style={styles.lookingText}>Finding product…</Text>
        </View>
      ) : null}

      <Pressable onPress={() => navigation.replace('AddItem')} style={styles.manualBtn}>
        <Text style={styles.manualText}>Enter manually</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  bigEmoji: { fontSize: 48 },
  title: { ...Typography.displaySmall, color: Colors.textPrimary },
  message: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  frame: {
    width: 260,
    height: 170,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.onPrimary,
    backgroundColor: 'transparent',
  },
  hint: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  lookingBar: {
    position: 'absolute',
    top: Spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  lookingText: { ...Typography.labelSmall, color: Colors.onPrimary },
  manualBtn: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  manualText: { ...Typography.labelLarge, color: Colors.textPrimary },
  linkBtn: { paddingVertical: Spacing.sm },
  link: { ...Typography.bodyMedium, color: Colors.gold },
});
