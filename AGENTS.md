# AGENTS.md — `@codexporer.io/expo-image-picker`

## Package Summary

`@codexporer.io/expo-image-picker` is a lightweight Expo ImagePicker wrapper. It handles camera roll and camera permission flows automatically. When permission is denied, it opens a dialog via `@codexporer.io/expo-message-dialog`. Theme tokens are read from `@codexporer.io/expo-app-theme`.

## Key Exports

- `useImagePicker(options?)` — main hook; returns `{ pickFromLibrary, pickFromCamera }`.
- `MediaType` — constant object `{ Images: 'images', Videos: 'videos' }`.

## Instructions for AI Agents

- **No `ImagePickerProvider`** — it has been removed. Do not add or reference it.
- **No `renderPermissionDialog()`** — it has been removed. Do not call or render it. Permission dialogs are handled internally via `useMessageDialogActions`.
- **No `useImagePickerRouter`** — it has been removed. Use `useImagePicker` directly in all cases.
- Always check `result.canceled` before accessing `result.assets` in `onPick`.
- `<MessageDialog />` from `@codexporer.io/expo-message-dialog` **must be mounted** somewhere in the app tree (e.g. in the root layout) for permission dialogs to render.
- `ThemeProvider` from `@codexporer.io/expo-app-theme` **must be mounted** above any component that calls `useImagePicker`.
- On Android, a loading dialog is shown while permissions are being requested. Ensure the loading dialog provider from `@codexporer.io/expo-loading-dialog` is also mounted.
