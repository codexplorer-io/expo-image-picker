import * as React from 'react';
import type { ImagePickerResult } from 'expo-image-picker';

export interface ImagePickerThemeColors {
    dialogBackground: string;
    dialogTitle: string;
    dialogMessage: string;
    modalButtonText: string;
    modalButtonBackground: string;
    modalButtonBorder: string;
    overlayBackground: string;
    shadowColor?: string;
}

export interface ImagePickerTheme {
    colors: ImagePickerThemeColors;
}

export interface ImagePickerProviderProps {
    children: React.ReactNode;
    theme: ImagePickerTheme;
}

export declare const ImagePickerProvider: React.FC<ImagePickerProviderProps>;

export declare const MediaType: {
    readonly Images: 'images';
    readonly Videos: 'videos';
};

export interface UseImagePickerOptions {
    mediaTypes?: 'images' | 'videos' | string;
    allowsEditing?: boolean;
    allowsMultipleSelection?: boolean;
    aspect?: [number, number];
    quality?: number;
    base64?: boolean;
    exif?: boolean;
    videoExportPreset?: number;
    onBeforePick?: () => void;
    onPick?: (result: ImagePickerResult) => void;
    onPickCancel?: () => void;
    onPickError?: (error: Error) => void;
}

export interface UseImagePickerReturn {
    pickFromLibrary: () => Promise<void>;
    pickFromCamera: () => Promise<void>;
    renderPermissionDialog: () => React.ReactElement;
}

export declare function useImagePicker(options?: UseImagePickerOptions): UseImagePickerReturn;
export declare const useImagePickerRouter: typeof useImagePicker;
