import React, { useState } from 'react';
import { di } from 'react-magnetic-di';
import * as ImagePicker from 'expo-image-picker';
import { OS } from '@codexporer.io/expo-device';
import { useLoadingDialogActions } from '@codexporer.io/expo-loading-dialog';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';

const DialogTitle = Dialog.Title;
const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

let isCameraRollPermissionGranted = false;
let isCameraPermissionGranted = false;

export const useImagePicker = ({
    mediaTypes,
    allowsEditing,
    aspect,
    quality,
    base64,
    exif,
    videoExportPreset,
    onPick
}) => {
    di(
        Button,
        Dialog,
        DialogActions,
        DialogContent,
        DialogTitle,
        Paragraph,
        Portal,
        useLoadingDialogActions,
        useState
    );

    const [isPermissionsDialogVisible, setIsPermissionsDialogVisible] = useState(false);
    const [permissionsDialogContent, setPermissionsDialogContent] = useState(null);
    const [, { show, hide }] = useLoadingDialogActions();

    const getCameraRollPermission = async ({ shouldAsk }) => {
        if (!shouldAsk) {
            return true;
        }

        if (isCameraRollPermissionGranted) {
            return true;
        }

        const {
            status,
            canAskAgain
        } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status === 'granted') {
            isCameraRollPermissionGranted = true;
            return true;
        }

        setPermissionsDialogContent(
            <Paragraph>
                {
                    canAskAgain ?
                        'Selecting a media file from the library requires media library access. Try to select media file from the library again and allow application to access your media library.' :
                        'Selecting a media file from the library requires media library access. Allow aplication to access the media library in phone settings and select media file afterwards.'
                }
            </Paragraph>
        );
        setIsPermissionsDialogVisible(true);
        return false;
    };

    const getCameraPermission = async () => {
        if (isCameraPermissionGranted) {
            return true;
        }

        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (status === 'granted') {
            isCameraPermissionGranted = true;
            return true;
        }

        setPermissionsDialogContent(
            <Paragraph>
                {
                    canAskAgain ?
                        'Taking a photo with the camera requires phone camera access. Try to take a photo again and allow application to access device camera.' :
                        'Taking a photo with the camera requires phone camera access. Allow aplication to access device camera in phone settings and take a photo again afterwards.'
                }
            </Paragraph>
        );
        setIsPermissionsDialogVisible(true);
        return false;
    };

    const pickFromLibrary = async () => {
        OS.isAndroid() && show();
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: OS.isAndroid() || OS.isIOS() === 'ios' && parseInt(OS.version(), 10) >= 10
        });
        OS.isAndroid() && hide();
        if (!hasCameraRollPermission) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes,
            allowsEditing,
            aspect,
            quality,
            base64,
            exif,
            videoExportPreset
        });

        !result.cancelled && onPick(result);
    };

    const pickFromCamera = async () => {
        OS.isAndroid() && show();
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: OS.isAndroid() || OS.isIOS() === 'ios' && parseInt(OS.version(), 10) >= 10
        });
        if (!hasCameraRollPermission) {
            OS.isAndroid() && hide();
            return;
        }

        const hasCameraPermission = await getCameraPermission();
        OS.isAndroid() && hide();
        if (!hasCameraPermission) {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes,
            allowsEditing,
            aspect,
            quality,
            base64,
            exif,
            videoExportPreset
        });

        !result.cancelled && onPick(result);
    };

    const onDismissPermissionsDialog = () => {
        setIsPermissionsDialogVisible(false);
    };

    const renderPermissionDialog = () => (
        <Portal>
            <Dialog
                visible={isPermissionsDialogVisible}
                onDismiss={onDismissPermissionsDialog}
            >
                <DialogTitle>
                    Access Required
                </DialogTitle>
                <DialogContent>
                    {permissionsDialogContent}
                </DialogContent>
                <DialogActions>
                    <Button
                        onPress={onDismissPermissionsDialog}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </Portal>
    );

    return {
        pickFromLibrary,
        pickFromCamera,
        renderPermissionDialog
    };
};
