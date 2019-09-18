For installing lwip do fix node-gyp 

1. setup (with Administrator rights)
>npm install --global --production windows-build-tools

1.1. install node-gyp
>npm i -g node-gyp

2. >npm config set msvs_version 2015

3. modify
~\.node-gyp\{node.version.number}\include\node\zlib.h
file with

#define ZLIB_VERNUM 0x1280
