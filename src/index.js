import React, { createContext, useContext, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { OS } from '@codexporer.io/expo-device';
import { useLoadingDialogActions } from '@codexporer.io/expo-loading-dialog';

const ImagePickerThemeContext = createContext(null);

export const ImagePickerProvider = ({ children, theme }) => {
    return (
        <ImagePickerThemeContext.Provider value={theme}>
            {children}
        </ImagePickerThemeContext.Provider>
    );
};

const useImagePickerTheme = () => {
    const context = useContext(ImagePickerThemeContext);
    if (!context) {
        throw new Error('useImagePickerTheme must be used within an ImagePickerProvider with a mandatory theme prop.');
    }
    return context;
};

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
    const [isPermissionsDialogVisible, setIsPermissionsDialogVisible] = useState(false);
    const [permissionsDialogContent, setPermissionsDialogContent] = useState(null);
    const [, { show: showLoadingDialog, hide: hideLoadingDialog }] = useLoadingDialogActions();

    const theme = useImagePickerTheme();
    const { colors } = theme;

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

        setPermissionsDialogContent(
            canAskAgain ?
                'Selecting a media file from the library requires media library access. Try to select media file from the library again and allow application to access your media library.' :
                'Selecting a media file from the library requires media library access. Allow application to access the media library in phone settings and select media file afterwards.'
        );
        setIsPermissionsDialogVisible(true);
        return false;
    };

    const getCameraPermission = async () => {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (status === 'granted') {
            return true;
        }

        setPermissionsDialogContent(
            canAskAgain ?
                'Taking a photo with the camera requires phone camera access. Try to take a photo again and allow application to access device camera.' :
                'Taking a photo with the camera requires phone camera access. Allow application to access device camera in phone settings and take a photo again afterwards.'
        );
        setIsPermissionsDialogVisible(true);
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

    const onDismissPermissionsDialog = () => {
        setIsPermissionsDialogVisible(false);
    };

    const renderPermissionDialog = () => (
        <Modal
            visible={isPermissionsDialogVisible}
            transparent
            animationType="fade"
            onRequestClose={onDismissPermissionsDialog}
        >
            <TouchableWithoutFeedback onPress={onDismissPermissionsDialog}>
                <View style={[styles.overlay, { backgroundColor: colors.overlayBackground }]}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.dialogContainer, { backgroundColor: colors.dialogBackground, shadowColor: colors.shadowColor }]}>
                            <Text style={[styles.title, { color: colors.dialogTitle }]}>
                                Access Required
                            </Text>
                            <Text style={[styles.message, { color: colors.dialogMessage }]}>
                                {permissionsDialogContent}
                            </Text>
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    onPress={onDismissPermissionsDialog}
                                    style={[
                                        styles.button,
                                        {
                                            backgroundColor: colors.modalButtonBackground,
                                            borderColor: colors.modalButtonBorder
                                        }
                                    ]}
                                >
                                    <Text style={[styles.buttonText, { color: colors.modalButtonText }]}>
                                        Ok
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return {
        pickFromLibrary,
        pickFromCamera,
        renderPermissionDialog
    };
};

export const useImagePickerRouter = useImagePicker;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    dialogContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});
