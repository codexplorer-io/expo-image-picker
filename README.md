# `@codexporer.io/expo-image-picker`

Media and photo picking hook for Expo and React Native applications. Handles camera roll and camera permissions automatically, showing a permission dialog via `@codexporer.io/expo-message-dialog` when access is denied. Theme is sourced from `@codexporer.io/expo-app-theme` — no manual theme configuration required.

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-image-picker
npx expo install expo-image-picker
```

Peer dependencies:
- `expo-image-picker` (`*`)
- `@codexporer.io/expo-app-theme` (`*`)
- `@codexporer.io/expo-message-dialog` (`*`)
- `@codexporer.io/expo-loading-dialog` (`*`)

## Prerequisites in Component Tree

Your app must mount the following near the root of the component tree:
- `ThemeProvider` from `@codexporer.io/expo-app-theme`
- `<MessageDialog />` from `@codexporer.io/expo-message-dialog` (renders permission dialogs)
- `<LoadingDialog />` from `@codexporer.io/expo-loading-dialog` (used on Android during media processing)

## Usage

```tsx
import { useImagePicker, MediaType } from '@codexporer.io/expo-image-picker';

export function AvatarPickerScreen() {
  const { pickFromLibrary, pickFromCamera } = useImagePicker({
    mediaTypes: MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
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

## API Reference

### `useImagePicker(options?): UseImagePickerReturn`

#### Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `mediaTypes` | `'images' \| 'videos' \| string` | Filter by media type. Use `MediaType.Images` or `MediaType.Videos`. |
| `allowsEditing` | `boolean` | Enable in-app crop/edit UI after picking. |
| `allowsMultipleSelection` | `boolean` | Allow selecting multiple assets (library only). |
| `aspect` | `[number, number]` | Crop aspect ratio when `allowsEditing` is true. |
| `quality` | `number` | Output compression quality (`0`–`1`). |
| `base64` | `boolean` | Include base64-encoded image data in result. |
| `exif` | `boolean` | Include EXIF metadata in result. |
| `videoExportPreset` | `number` | iOS video export preset. |
| `onBeforePick` | `() => void` | Called just before the picker UI is launched. |
| `onPick` | `(result: ImagePickerResult) => void` | Called with the picker result on success. |
| `onPickCancel` | `() => void` | Called when the user dismisses the picker. |
| `onPickError` | `(error: Error) => void` | Called if the picker throws an error. |

#### Return value

| Property | Type | Description |
| :--- | :--- | :--- |
| `pickFromLibrary` | `() => Promise<void>` | Opens the media library picker. |
| `pickFromCamera` | `() => Promise<void>` | Opens the camera. |

### `MediaType`

```ts
MediaType.Images // 'images'
MediaType.Videos // 'videos'
```

## Permission Handling

Permission dialogs are shown automatically via `@codexporer.io/expo-message-dialog` when the user denies camera roll or camera access. No extra setup is required beyond mounting `<MessageDialog />` in your app tree.

## License

MIT
