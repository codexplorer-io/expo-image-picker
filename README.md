# `@codexporer.io/expo-image-picker`

Media and photo picking hook for Expo and React Native applications with customizable, themed permission dialogs. Supports both Expo Router and React Navigation.

## Prerequisites

Ensure `expo-image-picker` is installed in your project root or workspace:

```bash
npx expo install expo-image-picker
```

## Theme & Provider Setup

Wrap your application root inside `ImagePickerProvider` and supply a mandatory `theme` object.

### `ImagePickerTheme` Interface

```typescript
interface ImagePickerTheme {
  colors: {
    dialogBackground: string;      // Modal container background
    dialogTitle: string;           // Modal title text color ("Access Required")
    dialogMessage: string;         // Modal message text color
    modalButtonText: string;       // Modal button text color ("Ok")
    modalButtonBackground: string; // Modal button background color
    modalButtonBorder: string;     // Modal button border color
    overlayBackground: string;    // Backdrop overlay background color
  };
}
```

### Setup Example

```tsx
import React, { useMemo } from 'react';
import { ImagePickerProvider, ImagePickerTheme } from '@codexporer.io/expo-image-picker';

export function AppProviders({ children }) {
  const imagePickerTheme = useMemo<ImagePickerTheme>(() => ({
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
    <ImagePickerProvider theme={imagePickerTheme}>
      {children}
    </ImagePickerProvider>
  );
}
```

## Hook Usage

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useImagePicker, MediaType } from '@codexporer.io/expo-image-picker';

export function AvatarPickerScreen() {
  const { pickFromLibrary, pickFromCamera, renderPermissionDialog } = useImagePicker({
    mediaTypes: MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    onPick: (result) => {
      if (!result.canceled && result.assets?.[0]) {
        console.log('Picked photo URI:', result.assets[0].uri);
      }
    },
    onPickError: (error) => {
      console.error('Photo pick error:', error);
    }
  });

  return (
    <View>
      <Button title="Choose from Library" onPress={pickFromLibrary} />
      <Button title="Take Photo" onPress={pickFromCamera} />
      {renderPermissionDialog()}
    </View>
  );
}
```

### Expo Router Support

```tsx
import { useImagePickerRouter } from '@codexporer.io/expo-image-picker';
```
