"""Generate lossless WebP release assets while preserving the PNG sources.

Optional maintenance tool: Python + Pillow. Runtime/build use committed WebP files.
"""
from pathlib import Path
from PIL import Image


def main() -> None:
    asset_dir = Path(__file__).resolve().parents[1] / 'src' / 'assets'
    before = after = 0
    for source in sorted(asset_dir.glob('*.png')):
        target = source.with_suffix('.webp')
        with Image.open(source) as original:
            pixels = original.convert('RGBA')
            pixels.save(target, 'WEBP', lossless=True, exact=True, method=6)
            with Image.open(target) as encoded:
                if encoded.convert('RGBA').tobytes() != pixels.tobytes():
                    raise ValueError(f'Pixel mismatch: {source.name}')
        before += source.stat().st_size
        after += target.stat().st_size
        print(f'{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes')
    print(f'Total: {before:,} -> {after:,} bytes ({100 * (1 - after / before):.1f}% smaller)')


if __name__ == '__main__':
    main()
