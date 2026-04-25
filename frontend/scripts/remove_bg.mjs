import sharp from 'sharp';

async function removeWhiteBg(inputPath, outputPath) {
    try {
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;
        // Simple threshold to turn white (or close to white) into transparent
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If the pixel is close to rgb(255, 255, 255), make alpha 0
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Alpha
            } else {
                // To avoid rough edges, we can do some simple anti-aliasing or blending
                // But a direct cutoff works well enough for testing.
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

removeWhiteBg('/Users/odgmusic/Documents/gen-audius-pro/frontend/public/user-logo-icon.png', '/Users/odgmusic/Documents/gen-audius-pro/frontend/public/user-logo-icon-trans.png');
removeWhiteBg('/Users/odgmusic/Documents/gen-audius-pro/frontend/public/user-logo-full.png', '/Users/odgmusic/Documents/gen-audius-pro/frontend/public/user-logo-full-trans.png');
