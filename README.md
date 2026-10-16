# `@codexporer.io/expo-image-picker`

Media and photo picking hook for Expo and React Native applications. Handles camera roll and camera permissions automatically, showing permission dialogs via `@codexporer.io/expo-message-dialog` when access is denied, and presenting progress on Android via `@codexporer.io/expo-loading-dialog`.

---

## Peer Dependencies

All peer dependencies are required and must be installed in consuming projects (none are optional):
- `react`: `*`
- `react-native`: `*`
- `expo-image-picker`: `*`
- `@codexporer.io/expo-device`: `*`
- `@codexporer.io/expo-loading-dialog`: `*`
- `@codexporer.io/expo-message-dialog`: `*`

---

## Installation

```bash
yarn add @codexporer.io/expo-image-picker
```

---

## Prerequisites in Component Tree

`useImagePicker` triggers permission alerts and loading state via actions. For these UI elements to display, your application must mount the following in the component tree (wrapped in `ThemeProvider` from `@codexporer.io/expo-app-theme`):
- `<MessageDialog />` from `@codexporer.io/expo-message-dialog` (renders permission denial messages)
- `<LoadingDialog />` from `@codexporer.io/expo-loading-dialog` (shown on Android during permission verification)

> **Note:** There is no `ImagePickerProvider`. The hook can be consumed directly anywhere inside the tree.

---

## Usage

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
      if (!result.canceled && result.assets?.[0]) {
        console.log('Picked URI:', result.assets[0].uri);
      }
    },
    onPickCancel: () => {
      console.log('User cancelled');
    },
    onPickError: (error) => {
      console.error('Pick error:', error);
    }
  });

  return (
    <View>
      <Button title="Choose from Library" onPress={pickFromLibrary} />
      <Button title="Take Photo" onPress={pickFromCamera} />
    </View>
  );
}
```

---

## API Reference

### `useImagePicker(options?): UseImagePickerReturn`

Main React hook providing library and camera picking functions with integrated permission handling.

#### Options (`UseImagePickerOptions`)

| Option | Type | Description |
| :--- | :--- | :--- |
| `mediaTypes` | `'images' \| 'videos' \| string` | Media types filter. Defaults to `[MediaType.Images, MediaType.Videos]` unless `MediaType.Images` is explicitly passed. |
| `allowsEditing` | `boolean` | Enable system crop/edit UI after picking. |
| `allowsMultipleSelection` | `boolean` | Allow selecting multiple assets (library only). |
| `aspect` | `[number, number]` | Crop aspect ratio tuple `[x, y]` when `allowsEditing` is true. |
| `quality` | `number` | Output compression quality (`0`–`1`). |
| `base64` | `boolean` | Include base64-encoded image data in result. |
| `exif` | `boolean` | Include EXIF metadata in result. |
| `videoExportPreset` | `number` | iOS video export preset. |
| `onBeforePick` | `() => void` | Invoked immediately before launching picker. |
| `onPick` | `(result: ImagePickerResult) => void` | Invoked with success result when media is selected. |
| `onPickCancel` | `() => void` | Invoked when the user dismisses the picker without selecting. |
| `onPickError` | `(error: Error) => void` | Invoked if launching the picker throws an error. |

#### Return Value (`UseImagePickerReturn`)

| Property | Type | Description |
| :--- | :--- | :--- |
| `pickFromLibrary` | `() => Promise<void>` | Requests media library permission (if required) and opens system library picker. |
| `pickFromCamera` | `() => Promise<void>` | Requests camera and media library permissions and opens system camera. |

---

### `MediaType`

Exported constant object for media filtering:
```ts
MediaType.Images // 'images'
MediaType.Videos // 'videos'
```

---

## Permission & Platform Handling

- **Automatic Permission Checks**:
  - Library picking checks media library permission on Android and iOS >= 10.
  - Camera picking checks media library permission followed by camera permission.
- **Alert Dialogs**:
  - Automatically dispatches via `useMessageDialogActions` with tailored messages depending on whether permissions can be asked again or require device settings adjustments.
- **Loading Overlay**:
  - On Android, triggers `useLoadingDialogActions` to show `<LoadingDialog />` while permissions are checked, preventing duplicate interactions.

---

## License

MIT
