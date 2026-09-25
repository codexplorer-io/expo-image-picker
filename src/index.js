import * as ImagePicker from 'expo-image-picker';
import { OS } from '@codexporer.io/expo-device';
import { useLoadingDialogActions } from '@codexporer.io/expo-loading-dialog';
import { useMessageDialogActions } from '@codexporer.io/expo-message-dialog';

export const MediaType = {
    Images: 'images',
    Videos: 'videos'
};

export const useImagePicker = ({
    mediaTypes,
    allowsEditing,
    allowsMultipleSelection,
    aspect,
    quality,
    base64,
    exif,
    videoExportPreset,
    onBeforePick,
    onPick,
    onPickCancel,
    onPickError
} = {}) => {
    const [, { show: showLoadingDialog, hide: hideLoadingDialog }] = useLoadingDialogActions();
    const [, { open: openMessageDialog }] = useMessageDialogActions();

    const showLoading = () => {
        if (OS.isAndroid()) {
            showLoadingDialog();
        }
    };

    const hideLoading = () => {
        if (OS.isAndroid()) {
            hideLoadingDialog();
        }
    };

    const showPermissionsDialog = (message) => {
        openMessageDialog({
            title: 'Access Required',
            message,
            actions: [{ text: 'Ok' }]
        });
    };

    const getCameraRollPermission = async ({ shouldAsk }) => {
        if (!shouldAsk) {
            return true;
        }

        const {
            status,
            canAskAgain
        } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status === 'granted') {
            return true;
        }

        showPermissionsDialog(
            canAskAgain ?
                'Selecting a media file from the library requires media library access. Try to select media file from the library again and allow application to access your media library.' :
                'Selecting a media file from the library requires media library access. Allow application to access the media library in phone settings and select media file afterwards.'
        );
        return false;
    };

    const getCameraPermission = async () => {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (status === 'granted') {
            return true;
        }

        showPermissionsDialog(
            canAskAgain ?
                'Taking a photo with the camera requires phone camera access. Try to take a photo again and allow application to access device camera.' :
                'Taking a photo with the camera requires phone camera access. Allow application to access device camera in phone settings and take a photo again afterwards.'
        );
        return false;
    };

    const pickFromLibrary = async () => {
        showLoading();
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: OS.isAndroid() || (OS.isIOS() && parseInt(OS.version(), 10) >= 10)
        });
        hideLoading();
        if (!hasCameraRollPermission) {
            return;
        }

        try {
            onBeforePick?.();
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: mediaTypes === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
                allowsEditing,
                allowsMultipleSelection,
                aspect,
                quality,
                base64,
                exif,
                videoExportPreset
            });

            if (result.canceled) {
                onPickCancel?.();
            } else {
                onPick?.(result);
            }
        } catch (error) {
            onPickError?.(error);
        }
    };

    const pickFromCamera = async () => {
        showLoading();
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: OS.isAndroid() || (OS.isIOS() && parseInt(OS.version(), 10) >= 10)
        });
        if (!hasCameraRollPermission) {
            hideLoading();
            return;
        }

        const hasCameraPermission = await getCameraPermission();
        hideLoading();
        if (!hasCameraPermission) {
            return;
        }

        try {
            onBeforePick?.();
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: mediaTypes === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
                allowsEditing,
                allowsMultipleSelection,
                aspect,
                quality,
                base64,
                exif,
                videoExportPreset
            });

            if (result.canceled) {
                onPickCancel?.();
            } else {
                onPick?.(result);
            }
        } catch (error) {
            onPickError?.(error);
        }
    };

    return {
        pickFromLibrary,
        pickFromCamera
    };
};
