import {v2 as cloudinary} from 'cloudinary';
import {ENV} from "./env.js";

// Only configure Cloudinary if credentials are provided
if (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
        api_key: ENV.CLOUDINARY_API_KEY,
        api_secret: ENV.CLOUDINARY_API_SECRET,
    });
} else {
    console.log("⚠️  Cloudinary credentials not provided, image uploads will be disabled");
}

export {cloudinary};
