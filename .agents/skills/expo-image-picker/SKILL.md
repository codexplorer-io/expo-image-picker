---
name: expo-image-picker
description: Instructions for using @codexporer.io/expo-image-picker for picking images/videos from camera and library with automated permission dialogs in React Native & Expo apps.
---

# `@codexporer.io/expo-image-picker` Skill

## Overview
`@codexporer.io/expo-image-picker` encapsulates Expo ImagePicker logic with automated permission handling via `@codexporer.io/expo-message-dialog` and loading overlays via `@codexporer.io/expo-loading-dialog`.

---

## Peer Dependencies

All 6 peer dependencies are required and must be installed in consuming projects (none are optional):
- `react`: `*`
- `react-native`: `*`
- `expo-image-picker`: `*`
- `@codexporer.io/expo-device`: `*`
- `@codexporer.io/expo-loading-dialog`: `*`
- `@codexporer.io/expo-message-dialog`: `*`

---

## When to Use
- Selecting photos or videos from the user's media library.
- Capturing new photos or videos with the device camera.
- Requiring automatic permission request dialogs and error alerts without boilerplate.

---

## Required Setup

### Prerequisites in Component Tree
Your application must mount the following near the top of the component tree (wrapped in `<ThemeProvider>` from `@codexporer.io/expo-app-theme`):

1. **`<MessageDialog />`** (from `@codexporer.io/expo-message-dialog`): Renders permission denial alerts automatically.
2. **`<LoadingDialog />`** (from `@codexporer.io/expo-loading-dialog`): Displayed on Android during media permission checks to prevent duplicate actions.

> **NOTE:** Do **not** use `ImagePickerProvider` (it does not exist). The hook can be used anywhere in your components.

---

## Hook Usage (`useImagePicker`)

The hook returns `{ pickFromLibrary, pickFromCamera }`. Permission dialogs are triggered automatically via `@codexporer.io/expo-message-dialog` when access is denied:

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useImagePicker, MediaType } from '@codexporer.io/expo-image-picker';

export function AvatarPickerScreen() {
  const { pickFromLibrary, pickFromCamera } = useImagePicker({
    mediaTypes: MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    onBeforePick: () => {
      console.log('Opening picker...');
    },
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
| `mediaTypes` | `MediaType.Images \| MediaType.Videos \| string` | Filter media type. If `MediaType.Images` ('images'), only images are allowed; otherwise defaults to `[MediaType.Images, MediaType.Videos]`. |
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
| `pickFromLibrary` | `() => Promise<void>` | Launches system photo library picker after permission check |
| `pickFromCamera` | `() => Promise<void>` | Launches system camera after permission checks |

### `MediaType`

```ts
MediaType.Images // 'images'
MediaType.Videos // 'videos'
```

---

## Critical Rules & Guidelines

1. **Mount Prerequisite Dialogs**: Always ensure `<MessageDialog />` and `<LoadingDialog />` are mounted in the app tree wrapped in `ThemeProvider`.
2. **Never Call `renderPermissionDialog`**: Do not look for or render a permission dialog component in JSX; the package delegates permission modals to `@codexporer.io/expo-message-dialog`.
3. **Handle Canceled Assets**: Always check `if (!result.canceled && result.assets?.[0]?.uri)` before processing picked files.
4. **Platform Specifics**:
   - Library permission is requested on Android and iOS >= 10 (`OS.isAndroid() || (OS.isIOS() && parseInt(OS.version(), 10) >= 10)`).
   - Camera permission check is preceded by media library check.
   - `<LoadingDialog />` is automatically activated on Android during permission verification.
5. **All 6 Peer Dependencies Required**: Consuming applications must install all 6 peer dependencies without marking any as optional.
