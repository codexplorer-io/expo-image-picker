import React, { useState } from 'react';
import { di } from 'react-magnetic-di';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';

const DialogTitle = Dialog.Title;
const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

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
    di(Button, Dialog, DialogActions, DialogContent, DialogTitle, Paragraph, Portal, useState);

    const [isPermissionsDialogVisible, setIsPermissionsDialogVisible] = useState(false);
    const [permissionsDialogContent, setPermissionsDialogContent] = useState(null);

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
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {
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
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: Platform.OS === 'android' || Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10
        });

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
        const hasCameraRollPermission = await getCameraRollPermission({
            shouldAsk: Platform.OS === 'android' || Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10
        });
        if (!hasCameraRollPermission) {
            return;
        }

        const hasCameraPermission = await getCameraPermission();
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
