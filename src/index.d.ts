import type { ImagePickerResult } from 'expo-image-picker';

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
}

export declare function useImagePicker(options?: UseImagePickerOptions): UseImagePickerReturn;
