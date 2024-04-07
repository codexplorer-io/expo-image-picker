# expo-image-picker
Image picker component for react-native & expo. Wrapper around <a href="https://docs.expo.dev/versions/latest/sdk/imagepicker/" target="_blank">expo-image-picker</a>.

## Platform Compatibility
iOS|Android|Web|
-|-|-|
✅|✅|❌|

## Samples
<img title="video" src="https://github.com/codexplorer-io/expo-image-picker/blob/main/samples/video.gif?raw=true">

## Prerequisites
Module requires installation and setup of <a href="https://github.com/codexplorer-io/expo-loading-dialog" target="_blank">@codexporer.io/expo-loading-dialog</a> within the project.

## Usage
```javascript
import { useImagePicker } from '@codexporer.io/expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
...

export const MyComponent = () => {
    const [imageSource, setImageSource] = useState(null);
    const {
        pickFromLibrary,
        pickFromCamera,
        renderPermissionDialog
    } = useImagePicker({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        onBeforePick: () => {
            // Invoked before pick, when picker is open
        },
        onPick: result => setImageSource(result),
        onPickCancel: () => {
            // Invoked if pick operation has been canceled
        },
        onPickError: error => {
            // Invoked if there was an error during pick operation
        }
    });
    ...
    
    return (
        <>
            <Button onPress={pickFromLibrary}>Choose from Library</Button>
            <Button onPress={pickFromCamera}>Take Picture</Button>
            <Image
                source={imageSource}
                resizeMode='contain'
            />
            {renderPermissionDialog()}
        </>
    );
};
```

## Exports
symbol|description|
-|-|
useImagePicker|hook used for image selection|

## useImagePicker
Takes options and returns `pickFromLibrary` (used to pick an image from device library), `pickFromCamera` (used to take a photo via device camera) and renderPermissionDialog (used to render permissions dialog with information about denied permissions) functions.

### Options
option|description|
-|-|
mediaTypes|choose what type of media to pick (<a href="https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions" target="_blank">ImagePicker.MediaTypeOptions</a>) (default: ImagePicker.MediaTypeOptions.Images)|
allowsEditing|whether to show a UI to edit the image/video after it is picked. Images: On Android the user can crop and rotate the image and on iOS simply crop it. Videos: On iOS user can trim the video (default: false)|
aspect|an array with two entries [x, y] specifying the aspect ratio to maintain if the user is allowed to edit the image (by passing allowsEditing: true). This is only applicable on Android, since on iOS the crop rectangle is always a square|
quality|specify the quality of compression, from 0 to 1. 0 means compress for small size, 1 means compress for maximum quality|
base64|whether to also include the image data in Base64 format|
exif|whether to also include the EXIF data for the image. On iOS the EXIF data does not include GPS tags in the camera case|
videoExportPreset|available on **iOS 11+ only**, but **deprecated**. Specify preset which will be used to compress selected video (<a href="https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickervideoexportpreset" target="_blank">ImagePicker.VideoExportPreset</a>) (default: ImagePicker.VideoExportPreset.Passthrough)|
onBeforePick|optional callback invoked when picker is open|
onPick|callback invoked when image is selected. When the chosen item is an image, calback will be invoked with `{ canceled: false, assets: [{ type: 'image', uri, width, height, exif, base64 }] }`; when the item is a video, calback will be invoked with `{ canceled: false, assets: [{ type: 'video', uri, width, height, duration }] }`|
onPickCancel|optional callback invoked if pick operation was canceled (mostly by the user)|
onPickError|optional callback invoked if there was an error during the pick operation. Takes the `error` object as an argument.|
