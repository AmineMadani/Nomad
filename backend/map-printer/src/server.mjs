import express from "express";
import mbgl from "@maplibre/maplibre-gl-native";
import sharp from "sharp";
import mapUtils from './utils/map.utils.mjs'
import templateStyle from "./templates/style.json" assert { type: "json" };
import morgan from "morgan";
import compression from "compression";
import basicAuth from "basic-auth";

const app = express();
const port = process.env.PORT || 3000;
const bodyParserLimit = '10mb';

app.use(express.json({limit: bodyParserLimit}));
app.use(express.urlencoded({ extended: true, limit: bodyParserLimit}));
app.use(morgan('combined'));
app.use(compression());

// Middleware for basic authentication
const authenticate = (req, res, next) => {
    const credentials = basicAuth(req);

    // Retrieve username and password from environment variables
    const username = process.env.AUTH_USERNAME;
    const password = process.env.AUTH_PASSWORD;

    // Check if credentials match environment variables
    if (!credentials || !checkCredentials(credentials.name, credentials.pass, username, password)) {
        res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
        return res.status(401).send('Unauthorized');
    }

    next();
};

// Function to check credentials 
const checkCredentials = (providedUsername, providedPassword, expectedUsername, expectedPassword) => {
    return providedUsername === expectedUsername && providedPassword === expectedPassword;
};



app.get('/',  authenticate, async (req, res) => {
    res.send('Image generator : /api/nomad-print/v1/basic/printer');
});

app.post('/api/nomad-print/v1/basic/printer',  authenticate,async (req, res) => {

    const height = req.body.height ?? 512;
    const width =  req.body.width ?? 512
    const channels = req.body.channels ?? 4;
    const sources = req.body.sources ?? {};
    const layers = req.body.layers ?? [];
    const images = req.body.images ?? [];

    if (!Object.keys(sources).length) {
        return res.status(400).send('Invalid sources format');
    }
    if (!Array.isArray(layers) || !layers.length) {
        return res.status(400).send('Invalid layers format');
    }
    if (height < 1 || height > 10000) {
        return res.status(400).send('height must be between 1 and 100000');
    }
    if (width < 1 || width > 10000) {
        return res.status(400).send('width must be between 1 and 100000');
    }
    if (channels < 1 || channels > 4) {
        return res.status(400).send('channels must be between 1 and 4');
    }

    const map = new mbgl.Map();

    //auto-compute zoom and center
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const key in sources) {
        if (sources[key].type === 'geojson') {
            sources[key].data.features.forEach(feature => {
                const coordinates = feature.geometry.coordinates;
                if (Array.isArray(coordinates) && coordinates.length > 0 && Array.isArray(coordinates[0])){                
                    coordinates.forEach(coordinate => {
                        const [longitude, latitude] = coordinate;
                        minX = Math.min(minX, longitude);
                        maxX = Math.max(maxX, longitude);
                        minY = Math.min(minY, latitude);
                        maxY = Math.max(maxY, latitude);
                    });
                }else if(Array.isArray(coordinates)){
                    const [longitude, latitude] = coordinates;
                    minX = Math.min(minX, longitude);
                    maxX = Math.max(maxX, longitude);
                    minY = Math.min(minY, latitude);
                    maxY = Math.max(maxY, latitude);
                }
            });

        }
    }
    let computedZoom = Math.log2(360 / (maxX - minX)) - 1;
    req.body.center = [(minX + maxX) / 2, (minY + maxY) / 2];
    req.body.zoom = Math.min(19, computedZoom);
    

    // build style 
    const style = {
        ...templateStyle,
        glyphs: req.body.glyphs,
        sources: {
            ...sources
        },
        layers: layers
    };

    // console.log(style);

    // load style to map
    map.load(style);

    // add images to map
    if(!!images && Array.isArray(images) && !!images.length) {
        try {
            await mapUtils.addImagesToMap(map, images);
        } catch (e) {
            const msg = `Error images: ${e}`;
            console.error(msg);
            return res.status(500).send(msg);
        }
    }

     // render map to buffer image
    let bufferImage;
    try {
        bufferImage = await mapUtils.mapRender(map, { center: req.body.center, zoom: req.body.zoom, width: width, height: height });
    } catch (e) {
        const msg = `Error rendering map`;
        console.error(msg , e);
        return res.status(500).send(msg);
    } 
    
    // generate output image
    let pngImage;
    try {
        const imgSharp = sharp(bufferImage, { raw: { width: width, height: height, channels: channels}});
        pngImage = await imgSharp.png().toBuffer();
    } catch(e) {
        const msg = `Technical error when generating image`;
        console.error(msg, e);
        return res.status(500).send(msg);
    }
    
    return res.type('png').send(pngImage);
});

app.get('/api/nomad-print/v1/basic/printer/health',  async (req, res) => {
    res.send('OK');
});

app.listen(port, () => {
    console.log(`Server is running  ...`);
});
