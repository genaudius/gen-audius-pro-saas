import sharp from 'sharp';

async function removeWhiteBg(inputPath, outputPath) {
    try {
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0;
            }
        }

        await sharp(data, {
            raw: {
                width,
                height,
                channels
            }
        })
        .png()
        .toFile(outputPath);

        console.log(`Successfully processed ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

if (process.argv.length >= 4) {
    removeWhiteBg(process.argv[2], process.argv[3]);
} else {
    removeWhiteBg('public/user-logo-icon.png', 'public/user-logo-icon-trans.png');
    removeWhiteBg('public/user-logo-full.png', 'public/user-logo-full-trans.png');
}
