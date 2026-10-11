---
name: expo-image-picker
description: Instructions for using @codexporer.io/expo-image-picker for picking images/videos from camera and library with automated permission dialogs in React Native & Expo apps.
---

# `@codexporer.io/expo-image-picker` Skill

## Overview
`@codexporer.io/expo-image-picker` encapsulates Expo ImagePicker logic with automated permission handling via `@codexporer.io/expo-message-dialog` and loading overlays via `@codexporer.io/expo-loading-dialog`.

---

## When to Use
- Selecting photos or videos from the user's media library.
- Capturing new photos or videos with the camera.
- Requiring automatic permission request dialogs without manual boilerplate checks.

---

## Required Setup

### Prerequisites in Component Tree
Your application must mount the following near the top of the component tree (e.g. in `_layout.tsx` or `App.tsx`):

1. **`ThemeProvider`** (from `@codexporer.io/expo-app-theme` or app provider).
2. **`<MessageDialog />`** (from `@codexporer.io/expo-message-dialog`): Renders the permission denial dialog automatically.
3. **`<LoadingDialog />`** (from `@codexporer.io/expo-loading-dialog`): Used during Android media processing.

> **NOTE:** Do **not** use `ImagePickerProvider` (it does not exist). No provider wrapper is required for this package.

---

## Hook Usage (`useImagePicker`)

The hook returns `{ pickFromLibrary, pickFromCamera }`. Permission dialogs are handled automatically by `@codexporer.io/expo-message-dialog` when access is denied:

```tsx
import React from 'react';
import { View } from 'react-native';
import { useImagePicker, MediaType } from '@codexporer.io/expo-image-picker';
import { Button } from '@codexporer.io/expo-button';

export function AvatarPickerScreen() {
  const { pickFromLibrary, pickFromCamera } = useImagePicker({
    mediaTypes: MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    onPick: (result) => {
      if (!result.canceled && result.assets?.[0]?.uri) {
        console.log('Selected image URI:', result.assets[0].uri);
      }
    },
    onPickCancel: () => {
      console.log('User cancelled picker');
    },
    onPickError: (error) => {
      console.error('Picker error:', error.message);
    }
  });

  return (
    <View style={{ gap: 12 }}>
      <Button title="Choose from Library" onPress={pickFromLibrary} />
      <Button title="Take Photo" onPress={pickFromCamera} />
    </View>
  );
}
```

---

## API Reference

### `useImagePicker(options?: UseImagePickerOptions): UseImagePickerReturn`

#### Options (`UseImagePickerOptions`)
| Option | Type | Description |
| :--- | :--- | :--- |
| `mediaTypes` | `MediaType.Images \| MediaType.Videos \| string` | Filter media type |
| `allowsEditing` | `boolean` | Enable in-app crop / edit interface after selection |
| `allowsMultipleSelection` | `boolean` | Allow selecting multiple assets (library only) |
| `aspect` | `[number, number]` | Aspect ratio tuple `[x, y]` when `allowsEditing` is true |
| `quality` | `number` | Compression quality (`0` to `1`) |
| `base64` | `boolean` | Include base64-encoded image data in result |
| `exif` | `boolean` | Include EXIF metadata in result |
| `videoExportPreset` | `number` | iOS video export preset |
| `onBeforePick` | `() => void` | Invoked immediately before launching native picker |
| `onPick` | `(result: ImagePickerResult) => void` | Invoked with success result |
| `onPickCancel` | `() => void` | Invoked when user cancels |
| `onPickError` | `(error: Error) => void` | Invoked on error |

#### Return Value (`UseImagePickerReturn`)
| Property | Type | Description |
| :--- | :--- | :--- |
| `pickFromLibrary` | `() => Promise<void>` | Launches system photo library picker |
| `pickFromCamera` | `() => Promise<void>` | Launches system camera |

### `MediaType`
```ts
MediaType.Images // 'images'
MediaType.Videos // 'videos'
```

---

## Critical Rules & Guidelines

1. **Prerequisite Dialogs**: Always ensure `<MessageDialog />` and `<LoadingDialog />` are mounted at the app root inside `ThemeProvider`.
2. **Never Call `renderPermissionDialog`**: Do not look for or render a permission dialog component in JSX; the package delegates permission modals to `@codexporer.io/expo-message-dialog`.
3. **Handle Canceled Assets**: Always check `if (!result.canceled && result.assets?.[0]?.uri)` before processing picked files.
4. **Use `MediaType` Constant**: Use `MediaType.Images` or `MediaType.Videos` instead of raw string literals.
