import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../theme';
import { categoryImage, foodEmoji } from '../utils/food';

interface FoodImageProps {
  imageUrl?: string | null;
  name?: string;
  category?: string;
  size?: number;
  radius?: number;
  style?: ViewStyle;
  // When true, don't fall back to a category stock photo — emoji only if no imageUrl.
  emojiFallbackOnly?: boolean;
}

// Shows a real food photo (scanned product image, or a keyworded category photo)
// and gracefully falls back to an emoji tile when offline or the image fails.
export const FoodImage: React.FC<FoodImageProps> = ({
  imageUrl,
  name,
  category,
  size = 56,
  radius = Radius.md,
  style,
  emojiFallbackOnly = false,
}) => {
  const [failed, setFailed] = useState(false);

  const uri =
    imageUrl || (emojiFallbackOnly ? undefined : categoryImage(category, name, Math.round(size * 2)));

  const showEmoji = !uri || failed;

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius }, style]}>
      {showEmoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{foodEmoji(name, category)}</Text>
      ) : (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          onError={() => setFailed(true)}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
