from pathlib import Path
from PIL import Image

def slice_sprite_sheet(image_path, output_dir, rows=2, cols=3):
    output = Path(output_dir); output.mkdir(parents=True, exist_ok=True)
    img = Image.open(image_path).convert('RGBA')
    tw, th = img.width // cols, img.height // rows
    for i in range(rows * cols):
        r, c = divmod(i, cols)
        tile = img.crop((c*tw, r*th, (c+1)*tw, (r+1)*th))
        tile.save(output / f'asset_panel_{i+1}.png', optimize=True)

if __name__ == '__main__':
    import sys
    slice_sprite_sheet(sys.argv[1], sys.argv[2])
