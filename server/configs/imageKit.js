import ImageKit from "imagekit";

let imagekit = null;

if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PUBLIC_KEY.trim() !== "") {
    imagekit = new ImageKit({
        publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
    });
} else {
    // Mock dummy imagekit to prevent startup exception
    imagekit = {
        upload: async () => {
            throw new Error("ImageKit is not configured.");
        },
        url: () => {
            return "";
        }
    };
}

export default imagekit;