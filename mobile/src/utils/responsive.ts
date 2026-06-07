import { Platform, useWindowDimensions } from 'react-native';

// Number of grid columns for lists. Mobile/native is always 1; wide web fans out.
export const useColumns = (): number => {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return 1;
  if (width >= 1500) return 3;
  if (width >= 900) return 2;
  return 1;
};
