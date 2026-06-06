import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@sp/access_token',
  REFRESH_TOKEN: '@sp/refresh_token',
} as const;

export const getTokens = async () => {
  const pairs = await AsyncStorage.multiGet([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN]);
  return {
    accessToken: pairs[0][1],
    refreshToken: pairs[1][1],
  };
};

export const setTokens = async (tokens: { accessToken: string; refreshToken: string }) => {
  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, tokens.accessToken],
    [KEYS.REFRESH_TOKEN, tokens.refreshToken],
  ]);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN]);
};
