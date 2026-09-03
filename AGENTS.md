# AGENTS.md - `@codexporer.io/expo-image-picker` Instructions

## Package Summary
`@codexporer.io/expo-image-picker` is an Expo ImagePicker wrapper providing themed permission modals and loading state hooks.

## Key Exports
- `ImagePickerProvider`: Context provider requiring a `theme` object (`ImagePickerTheme`).
- `useImagePicker({ mediaTypes, allowsEditing, aspect, quality, onPick, onPickError })`
- `useImagePickerRouter`: Navigation helper for Expo Router.
- `MediaType`: Enum object `{ Images: 'images', Videos: 'videos' }`.

## Instructions for AI Agents
- Always check `result.canceled` before accessing `result.assets`.
- Ensure `{renderPermissionDialog()}` is included in component render output.
- Pass `theme` with required `colors` object (`dialogBackground`, `dialogTitle`, `dialogMessage`, `modalButtonText`, `modalButtonBackground`, `modalButtonBorder`, `overlayBackground`).
- **Memoize Theme Objects**: Wrap inline `theme` objects in `useMemo` when rendered inside React components (or define statically outside component body) to preserve reference stability.
