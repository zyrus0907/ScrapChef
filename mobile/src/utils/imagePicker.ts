import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  base64: string;
  mimeType: string;
}

// Pick an image from the library and return it as base64 + mime type.
// Works on native (asset.base64) and web (falls back to reading the blob).
export async function pickImageBase64(): Promise<PickedImage | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, base64: true });
  if (res.canceled || !res.assets?.length) return null;
  const asset = res.assets[0];
  const mimeType = asset.mimeType || 'image/jpeg';

  if (asset.base64) return { base64: asset.base64, mimeType };

  // Web fallback: read the picked file into a base64 data URL.
  const resp = await fetch(asset.uri);
  const blob = await resp.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('read failed'));
    fr.readAsDataURL(blob);
  });
  return { base64: dataUrl.split(',')[1] ?? '', mimeType: blob.type || mimeType };
}
