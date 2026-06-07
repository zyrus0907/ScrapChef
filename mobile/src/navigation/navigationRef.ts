import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    // @ts-expect-error loose names for cross-navigator navigation
    navigationRef.navigate(name, params);
  }
};
