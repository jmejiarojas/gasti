import sharp from "sharp";

const sizes = [192, 512];

await Promise.all(
  sizes.map((size) =>
    sharp("public/gasti-icon.svg")
      .resize(size, size)
      .png()
      .toFile(`public/gasti-icon-${size}.png`),
  ),
);
