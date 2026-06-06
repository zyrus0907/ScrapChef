import { Platform } from 'react-native';

// Decode a barcode from an image URI. Web-only (uses the browser DOM via zxing);
// returns null elsewhere or when no code is found. zxing is imported lazily so
// it never loads into the native bundle.
export async function decodeBarcodeFromUri(uri: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/library');
    const reader = new BrowserMultiFormatReader();
    const result = await reader.decodeFromImageUrl(uri);
    return result?.getText() ?? null;
  } catch {
    return null;
  }
}
