import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { lookupBarcode } from '../../api/barcode';
import { decodeBarcodeFromUri } from '../../utils/decodeBarcode';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export const ScanScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [looking, setLooking] = useState(false);
  const [manual, setManual] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const lockRef = useRef(false);

  // Shared: given a barcode string, look it up and open a prefilled Add Item.
  const submitBarcode = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLooking(true);
    const product = await lookupBarcode(trimmed);
    setLooking(false);
    navigation.replace('AddItem', {
      prefill: {
        barcode: trimmed,
        name: product?.name ?? '',
        category: product?.category,
        imageUrl: product?.imageUrl,
        brand: product?.brand,
      },
    });
  };

  const onCameraScanned = ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    submitBarcode(data);
  };

  const pickAndDecode = async () => {
    setNote(null);
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (res.canceled || !res.assets?.length) return;
    setLooking(true);
    const code = await decodeBarcodeFromUri(res.assets[0].uri);
    setLooking(false);
    if (code) {
      submitBarcode(code);
    } else {
      setNote("Couldn't read a barcode in that image. Try a clearer photo, or type the number below.");
    }
  };

  // ---- Web (and any no-camera platform): upload a photo or type the number ----
  if (Platform.OS === 'web' || !permission) {
    const cameraUnsupported = Platform.OS === 'web';
    if (!cameraUnsupported && !permission) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      );
    }
    return (
      <View style={styles.webWrap}>
        <Text style={styles.bigEmoji}>🏷️</Text>
        <Text style={styles.title}>Add by barcode</Text>
        <Text style={styles.message}>
          Upload a photo of the barcode and we'll read it, or just type the number printed under it.
        </Text>

        <Button label={looking ? 'Working…' : 'Upload barcode photo'} onPress={pickAndDecode} loading={looking} />

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Input
          label="Barcode number"
          value={manual}
          onChangeText={setManual}
          keyboardType="number-pad"
          placeholder="e.g. 3017620422003"
        />
        <Button label="Look up product" variant="outline" onPress={() => submitBarcode(manual)} />

        {note ? <Text style={styles.note}>{note}</Text> : null}

        <Pressable onPress={() => navigation.replace('AddItem')} style={styles.linkBtn}>
          <Text style={styles.link}>Add manually instead</Text>
        </Pressable>
      </View>
    );
  }

  // ---- Native: live camera scanning ----
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
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={looking ? undefined : onCameraScanned}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>{looking ? 'Looking up product…' : 'Point at a barcode'}</Text>
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
  webWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  bigEmoji: { fontSize: 48, textAlign: 'center' },
  title: { ...Typography.displaySmall, color: Colors.textPrimary, textAlign: 'center' },
  message: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { ...Typography.labelSmall, color: Colors.textMuted },
  note: { ...Typography.bodySmall, color: Colors.warning, marginTop: Spacing.md, textAlign: 'center' },
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
  frame: { width: 260, height: 170, borderRadius: Radius.lg, borderWidth: 3, borderColor: Colors.onPrimary },
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
  linkBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  link: { ...Typography.bodyMedium, color: Colors.gold },
});
