import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';
import { act } from 'react-dom/test-utils';
import { injectable } from 'react-magnetic-di';
import {
    mountWithDi,
    runHookWithDi,
    createMockComponent
} from '@codexporer.io/react-test-utils';
import { useImagePicker } from './index';

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn()
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    ...jest.requireActual('react-native/Libraries/Utilities/Platform'),
    OS: 'mockOS',
    Version: 'mockVersion'
}));

const DialogTitle = Dialog.Title;
const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

const STATUS_GRANTED = 'granted';
const STATUS_DENIED = 'denied';

describe('useImagePicker', () => {
    const deps = [
        injectable(Button, createMockComponent('Button')),
        injectable(Dialog, createMockComponent('Dialog')),
        injectable(DialogTitle, createMockComponent('DialogTitle')),
        injectable(DialogActions, createMockComponent('DialogActions')),
        injectable(DialogContent, createMockComponent('DialogContent')),
        injectable(Paragraph, createMockComponent('Paragraph')),
        injectable(Portal, createMockComponent('Portal'))
    ];

    const defaultProps = {
        mediaTypes: 'mediaTypesMock',
        allowsEditing: 'allowsEditingMock',
        aspect: 'aspectMock',
        quality: 'qualityMock',
        base64: 'base64Mock',
        exif: 'exifMock',
        videoExportPreset: 'videoExportPresetMock',
        onPick: jest.fn()
    };

    beforeEach(() => {
        Platform.OS = 'android';
        Platform.Version = '5.2.2';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('renderPermissionDialog', () => {
        const renderPermissionDialogVisible = async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            ).find('Dialog').prop('visible')).toBe(false);
            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            ).find('Dialog').prop('visible')).toBe(true);

            return result;
        };

        it('should render permissin dialog invisible', () => {
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );

            expect(wrapper.name()).toBe('Portal');
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').props()).toEqual({
                children: expect.any(Object),
                onDismiss: expect.any(Function),
                visible: false
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogTitle').props()).toEqual({
                children: 'Access Required'
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').props()).toEqual({
                children: null
            });
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogActions').find('Button').props()).toEqual({
                children: 'Ok',
                onPress: expect.any(Function)
            });
        });

        it('should dismiss permission dialog on dismiss', async () => {
            const result = await renderPermissionDialogVisible();

            act(() => {
                // eslint-disable-next-line lodash/prefer-lodash-method
                mountWithDi(
                    result.hookResult.renderPermissionDialog(),
                    { deps }
                ).find('Dialog').prop('onDismiss')();
                result.update();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            ).find('Dialog').prop('visible')).toBe(false);
        });

        it('should dismiss permission dialog on button click', async () => {
            const result = await renderPermissionDialogVisible();

            act(() => {
                // eslint-disable-next-line lodash/prefer-lodash-method
                mountWithDi(
                    result.hookResult.renderPermissionDialog(),
                    { deps }
                ).find('Button').prop('onPress')();
                result.update();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            ).find('Dialog').prop('visible')).toBe(false);
        });
    });

    describe('pickFromLibrary', () => {
        beforeEach(() => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            ImagePicker.launchImageLibraryAsync.mockResolvedValue({
                cancelled: false
            });
        });

        it('should ask for media permissions when android', async () => {
            Platform.OS = 'android';
            Platform.Version = '5.2.2';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
        });

        it('should ask for media permissions when iOS 10 or higher', async () => {
            Platform.OS = 'ios';
            Platform.Version = '10.2.2';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
        });

        it('should not ask for media permissions when iOS below 10', async () => {
            Platform.OS = 'ios';
            Platform.Version = '9.9.9';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
        });

        it('should render permission dialog visible with directions to pick image again', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Selecting a media file from the library requires media library access. Try to select media file from the library again and allow application to access your media library.'
            );
            expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog visible with directions to allow access through phone settings', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Selecting a media file from the library requires media library access. Allow aplication to access the media library in phone settings and select media file afterwards.'
            );
            expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog invisible when access is granted', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(false);
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
        });

        it('should call launchImageLibraryAsync when access is granted', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
                mediaTypes: 'mediaTypesMock',
                allowsEditing: 'allowsEditingMock',
                aspect: 'aspectMock',
                quality: 'qualityMock',
                base64: 'base64Mock',
                exif: 'exifMock',
                videoExportPreset: 'videoExportPresetMock'
            });
        });

        it('should not call launchImageLibraryAsync when access is denied', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
        });

        it('should call onPick when selection is not cancelled', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.launchImageLibraryAsync.mockResolvedValue({
                cancelled: false,
                image: 'mockImage'
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(defaultProps.onPick).toHaveBeenCalledTimes(1);
            expect(defaultProps.onPick).toHaveBeenCalledWith({
                cancelled: false,
                image: 'mockImage'
            });
        });

        it('should not call onPick when selection is cancelled', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.launchImageLibraryAsync.mockResolvedValue({
                cancelled: true,
                image: 'mockImage'
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromLibrary();
                result.update();
            });

            expect(defaultProps.onPick).not.toHaveBeenCalled();
        });
    });

    describe('pickFromCamera', () => {
        beforeEach(() => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            ImagePicker.launchCameraAsync.mockResolvedValue({
                cancelled: false
            });
        });

        it('should ask for media permissions when android', async () => {
            Platform.OS = 'android';
            Platform.Version = '5.2.2';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
        });

        it('should ask for media permissions when iOS 10 or higher', async () => {
            Platform.OS = 'ios';
            Platform.Version = '10.2.2';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
        });

        it('should not ask for media permissions when iOS below 10', async () => {
            Platform.OS = 'ios';
            Platform.Version = '9.9.9';
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
            expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
        });

        it('should render permission dialog visible with directions to pick image again', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Selecting a media file from the library requires media library access. Try to select media file from the library again and allow application to access your media library.'
            );
            expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog visible with directions to allow access through phone settings before picking an image', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Selecting a media file from the library requires media library access. Allow aplication to access the media library in phone settings and select media file afterwards.'
            );
            expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog visible with directions to take a photo again', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: true
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Taking a photo with the camera requires phone camera access. Try to take a photo again and allow application to access device camera.'
            );
            expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog visible with directions to allow access through phone settings before taking a photo', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(true);
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('DialogContent').find('Paragraph').prop('children')).toBe(
                'Taking a photo with the camera requires phone camera access. Allow aplication to access device camera in phone settings and take a photo again afterwards.'
            );
            expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
        });

        it('should render permission dialog invisible when access is granted', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            const wrapper = mountWithDi(
                result.hookResult.renderPermissionDialog(),
                { deps }
            );
            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('Dialog').prop('visible')).toBe(false);
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
        });

        it('should call launchCameraAsync when access is granted', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
            expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
                mediaTypes: 'mediaTypesMock',
                allowsEditing: 'allowsEditingMock',
                aspect: 'aspectMock',
                quality: 'qualityMock',
                base64: 'base64Mock',
                exif: 'exifMock',
                videoExportPreset: 'videoExportPresetMock'
            });
        });

        it('should not call launchCameraAsync when media library access is denied', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
        });

        it('should not call launchCameraAsync when camera access is denied', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_DENIED,
                canAskAgain: false
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
        });

        it('should call onPick when selection is not cancelled', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.launchCameraAsync.mockResolvedValue({
                cancelled: false,
                image: 'mockImage'
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(defaultProps.onPick).toHaveBeenCalledTimes(1);
            expect(defaultProps.onPick).toHaveBeenCalledWith({
                cancelled: false,
                image: 'mockImage'
            });
        });

        it('should not call onPick when selection is cancelled', async () => {
            ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
                status: STATUS_GRANTED,
                canAskAgain: false
            });
            ImagePicker.launchCameraAsync.mockResolvedValue({
                cancelled: true,
                image: 'mockImage'
            });
            const result = runHookWithDi(
                () => useImagePicker(defaultProps),
                { deps }
            );

            await act(async () => {
                await result.hookResult.pickFromCamera();
                result.update();
            });

            expect(defaultProps.onPick).not.toHaveBeenCalled();
        });
    });
});
