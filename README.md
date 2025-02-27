# Zipic

<div align="center">
  <img src="https://pichome-1254392422.cos.ap-chengdu.myqcloud.com/uPic/zipic-logo.png" width="128">
  <h1 align="center">Zipic</h1>
  <h4 align="center">Efficient, Minimalist Image Compression Tool</h4>
</div>

## Requirement

[**Zipic**](https://zipic.app) needs to be installed in order to use this extension.

<img src="https://pichome-1254392422.cos.ap-chengdu.myqcloud.com/uPic/zipic.webp" width="800">

## Commands

| name                       | description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `Compress Images`          | Compress selected images with Zipic using default settings.  |
| `Compress Images with Options` | Configure compression options before compressing selected images. |

## Compression Options

This extension supports configuring compression options in two ways:

### 1. Default Settings

You can set default compression options in the extension preferences:

- **Compression Level**: Set the compression level (1-6). Higher levels mean greater compression but lower quality.
- **Output Format**: Choose from original, JPEG, WebP, HEIC, AVIF, or PNG formats.
- **Save Location**: Save to the original location or a custom directory.
- **Use Default Save Directory**: When using custom location, enable this to use Zipic's default save directory.
- **Custom Directory**: Specify a custom directory when using custom save location and not using default save directory.
- **Width/Height**: Resize images to specific dimensions (0 for auto-adjust).
- **Add Suffix**: Add a suffix to compressed file names.
- **Suffix**: Customize the suffix for compressed files.
- **Add Subfolder**: Save compressed files in a subfolder.

### 2. Interactive Configuration

Use the `Compress Images with Options` command to configure compression options interactively before compressing. This allows you to:

- Adjust settings for specific compression tasks without changing your defaults
- Preview the selected files before compression
- Customize all compression parameters in a user-friendly interface
- Select a save directory using a folder picker when using custom location

## URL Scheme

This extension uses Zipic's URL scheme to compress images. The URL format follows the official Zipic documentation:

```
zipic://compress?url=/path/to/image1&url=/path/to/image2&level=3.0&format=webp...
```

## Screen record

<https://pichome-1254392422.cos.ap-chengdu.myqcloud.com/uPic/zipic_raycast_command_preview.mp4>
