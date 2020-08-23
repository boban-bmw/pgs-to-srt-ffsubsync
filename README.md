# pgs-to-srt-ffsubsync

Extract PGS subtitles from your media, generate .srt "binary string" subtitles from them and then use those as a reference for `ffsubsync`.

## How it works

1. Recursively find all `.mkv` files in provided directory
2. Extract `.sup` (PGS) streams, if present
3. Generate `.srt` binary string subtitles from `.sup`
4. For each `.srt` file in the same directory as the `.mkv`, attempt to sync with generated binary string subtitles
5. The lowest offset & framerate scale "wins"

`pgs-to-srt-ffsubsync` will leave behind `.sup` and generated `.srt` files in the `tmp` folder and will not regenerate them if they are present.

## Usage

```
git clone https://github.com/boban-bmw/pgs-to-srt-ffsubsync.git
cd pgs-to-srt-ffsubsync
npm install
npm run build
npm run start -- --src /path/to/your/media
```

## Requirements

The following need to be available on `PATH`:

* `ffmpeg` - `v4.2.4`
* `ffsubsync` - `v0.4.6`
* `node` - `v14`

## License

MIT
