---
name: expo-image-picker
description: Instructions for using @codexporer.io/expo-image-picker for picking images/videos from camera and library with themed permission dialogs in React Native & Expo apps.
---

# `@codexporer.io/expo-image-picker` Skill

## Overview
`@codexporer.io/expo-image-picker` encapsulates Expo ImagePicker logic with a themed, customizable permission modal dialog and seamless `@codexporer.io/expo-loading-dialog` integration on Android.

## Required Setup
Wrap the app root in `ImagePickerProvider` with a valid `theme` object.

### Static Theme (Declared Outside Render Scope)
```tsx
import { ImagePickerProvider, ImagePickerTheme } from '@codexporer.io/expo-image-picker';

const theme: ImagePickerTheme = {
  colors: {
    dialogBackground: '#ffffff',
    dialogTitle: '#18181b',
    dialogMessage: '#71717a',
    modalButtonText: '#6366f1',
    modalButtonBackground: '#f4f4f5',
    modalButtonBorder: '#e4e4e7',
    overlayBackground: 'rgba(0, 0, 0, 0.5)'
  }
};

export function RootLayout({ children }) {
  return (
    <ImagePickerProvider theme={theme}>
      {children}
    </ImagePickerProvider>
  );
}
```

### Dynamic Theme (Memoized Inside Component Render)
```tsx
import React, { useMemo } from 'react';
import { ImagePickerProvider, ImagePickerTheme } from '@codexporer.io/expo-image-picker';

export function AppProviders({ children }) {
  const theme = useMemo<ImagePickerTheme>(() => ({
    colors: {
      dialogBackground: '#ffffff',
      dialogTitle: '#18181b',
      dialogMessage: '#71717a',
      modalButtonText: '#6366f1',
      modalButtonBackground: '#f4f4f5',
      modalButtonBorder: '#e4e4e7',
      overlayBackground: 'rgba(0, 0, 0, 0.5)'
    }
  }), []);

  return (
    <ImagePickerProvider theme={theme}>
      {children}
    </ImagePickerProvider>
  );
}
```

## Hook Usage (`useImagePicker`)

```tsx
import { useImagePicker, MediaType } from '@codexporer.io/expo-image-picker';

const { pickFromLibrary, pickFromCamera, renderPermissionDialog } = useImagePicker({
  mediaTypes: MediaType.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
  onPick: (result) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      console.log('Selected image:', result.assets[0].uri);
    }
  },
  onPickError: (error) => {
    console.error('Pick error:', error.message);
  }
});

// Render renderPermissionDialog() in component tree:
return (
  <View>
    <Button title="Pick Photo" onPress={pickFromLibrary} />
    <Button title="Take Photo" onPress={pickFromCamera} />
    {renderPermissionDialog()}
  </View>
);
```

## Mandatory Guidelines
1. **Always Render Permission Dialog**: Components invoking `useImagePicker` MUST return `{renderPermissionDialog()}` at the bottom of their JSX tree.
2. **Handle Non-Canceled Assets**: Check `if (!result.canceled && result.assets?.[0]?.uri)` inside `onPick`.
3. **Expo Router Support**: For Expo Router integration, import `useImagePickerRouter`.
4. **Memoize Theme Objects**: When initializing the `theme` prop inside a React component render, ALWAYS memoize it using `useMemo` (or declare statically outside component scope) to maintain object reference stability and avoid unnecessary re-renders.
