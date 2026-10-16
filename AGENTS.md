# AGENTS.md — `@codexporer.io/expo-image-picker`

## Package Overview

`@codexporer.io/expo-image-picker` is a headless React hook wrapper around `expo-image-picker`. It handles camera roll and camera permission flows automatically without boilerplate. When permission is denied, it opens a modal dialog via `@codexporer.io/expo-message-dialog`. On Android, it indicates progress via `@codexporer.io/expo-loading-dialog`.

---

## Peer Dependencies

All 6 peer dependencies must be installed in consuming projects (none are optional):
- `react`: `*`
- `react-native`: `*`
- `expo-image-picker`: `*`
- `@codexporer.io/expo-device`: `*`
- `@codexporer.io/expo-loading-dialog`: `*`
- `@codexporer.io/expo-message-dialog`: `*`

---

## Key Exports

- `useImagePicker(options?)` — main hook returning `{ pickFromLibrary, pickFromCamera }`.
- `MediaType` — constant object `{ Images: 'images', Videos: 'videos' }`.

---

## Instructions for AI Agents

- **No `ImagePickerProvider`**: It does not exist. Do not add, import, or reference it.
- **No `renderPermissionDialog()`**: It does not exist. Permission dialogs are triggered internally using `useMessageDialogActions`.
- **No `useImagePickerRouter`**: It does not exist. Use `useImagePicker` directly.
- **Root Dialog Mounts Required**:
  - `<MessageDialog />` from `@codexporer.io/expo-message-dialog` must be mounted in the root component tree for permission dialogs to display.
  - `<LoadingDialog />` from `@codexporer.io/expo-loading-dialog` must be mounted in the root component tree (used on Android during permission checks).
  - Both dialogs must be inside `<ThemeProvider>` from `@codexporer.io/expo-app-theme`.
- **Permission Checking Logic**:
  - Library picking checks permissions on Android and iOS >= 10 (`OS.isAndroid() || (OS.isIOS() && parseInt(OS.version(), 10) >= 10)`).
  - Camera picking verifies library permission first, then camera permission.
- **Result Handling**:
  - Always check `result.canceled` before accessing `result.assets` in `onPick`.
  - Handle errors via `onPickError(error)` and dismissals via `onPickCancel()`.
- **Media Type Filtering**:
  - `mediaTypes: MediaType.Images` passes `'images'`.
  - Any other value or omission defaults to `[MediaType.Images, MediaType.Videos]`.
