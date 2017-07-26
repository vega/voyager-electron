# Electron based voyager app.

### App packaging

To build OS X/Linux/Windows binaries for this project. Run `yarn run dist` (for current platform) or `yarn run dist-all` (for cross platform builds).

See https://github.com/electron-userland/electron-builder for more documentation on the build tool.

### Cross platform build on OX X

If building for `windows` on `mac os x`, you need to have `wine` and `gtar` installed. `brew install wine` and `brew install gtar` if you use homebrew. For more info refer to https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#os-x