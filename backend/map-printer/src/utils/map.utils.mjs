import sharp from "sharp";

const isValidImageStyle = (imageStyle) => {
    return Object.hasOwn(imageStyle, 'code') && Object.hasOwn(imageStyle,'source'); 
}

const addImageToMap = async (map, imageStyle) => {
    if (!isValidImageStyle(imageStyle)) {
        const msg = 'Invalid image style';
        console.error(msg);
    }
    try {
        const imgBuffer = Buffer.from(imageStyle.source.split('base64,')[1], 'base64');
        const img = sharp(imgBuffer);
        const metadata = await img.metadata();
        const data = await img.raw().toBuffer();
        await map.addImage(imageStyle.code, data, {
            width: metadata.width,
            height: metadata.height,
            pixelRatio: 1,
            sdf: false,
        })
    } catch (e) {
        const msg = `Error when adding image with code=${imageStyle.code}`;
        console.error(msg);
    }
}

const addImagesToMap = async (map, imageStyles) => {
    for(let imageStyle of imageStyles) {
        await addImageToMap(map, imageStyle);
    }
}

const mapRender = (map, options) => {
    return new Promise((resolve, reject) => {
        map.render(options, (err, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(buffer)
        });
    });
}

export default { 
    addImagesToMap,
    mapRender,
}