# configs/imagekit.py

import os
from dotenv import load_dotenv

load_dotenv()

private_key = os.getenv("IMAGEKIT_PRIVATE_KEY")
public_key = os.getenv("IMAGEKIT_PUBLIC_KEY")
url_endpoint = os.getenv("IMAGEKIT_URL_ENDPOINT")

imagekit = None

if private_key and private_key.strip():
    try:
        from imagekitio import ImageKit
        imagekit = ImageKit(
            private_key=private_key,
            public_key=public_key,
            url_endpoint=url_endpoint
        )
    except Exception as e:
        print(f"Error initializing ImageKit: {e}")