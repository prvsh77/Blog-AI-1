import json
from datetime import datetime
from fastapi import UploadFile, Query
from configs.db import get_db
from configs.imagekit import imagekit
from configs.gemini import generate_content as ai_generate
from utils.serialize import serialize_blog, serialize_comment
from bson import ObjectId
from bson.errors import InvalidId
 

async def add_blog(image: UploadFile | None, blog_json: str):
    import os
    payload = json.loads(blog_json)
    title = payload.get("title")
    subTitle = payload.get("subTitle")
    description = payload.get("description")
    category = payload.get("category")
    isPublished = payload.get("isPublished")
    if not title or not description or not category:
        return {"success": False, "message": "Missing required fields"}

    from configs.imagekit import imagekit

    optimized_url = ""
    if image and image.filename:
        if imagekit:
            try:
                content = await image.read()
                upload = imagekit.upload_file(file=content, file_name=image.filename, options={"folder": "/blogs"})
                optimized_url = imagekit.url({
                    "path": upload.get("filePath"),
                    "transformation": [
                        {"quality": "auto"},
                        {"format": "webp"},
                        {"width": "1280"}
                    ]
                })
            except Exception as e:
                return {"success": False, "message": f"ImageKit upload failed: {str(e)}"}
        else:
            # Local fallback storage
            try:
                if not os.path.exists("uploads"):
                    os.makedirs("uploads")
                filename = f"{int(datetime.utcnow().timestamp())}_{image.filename}"
                filepath = os.path.join("uploads", filename)
                content = await image.read()
                with open(filepath, "wb") as f:
                    f.write(content)
                port = os.getenv("PORT", "3000")
                optimized_url = f"http://localhost:{port}/uploads/{filename}"
            except Exception as e:
                return {"success": False, "message": f"Local image storage failed: {str(e)}"}
    else:
        # Stock category images
        category_images = {
            "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80",
            "Startups": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80",
            "Lifestyle": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1280&q=80",
            "Finance": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80"
        }
        optimized_url = category_images.get(category, category_images["Technology"])

    doc = {
        "title": title,
        "subTitle": subTitle,
        "description": description,
        "category": category,
        "image": optimized_url,
        "isPublished": bool(isPublished),
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    db = get_db()
    await db["blogs"].insert_one(doc)
    return {"success": True, "message": "Blog added successfully"}

async def get_all_blogs():
    db = get_db()
    cursor = (
        db["blogs"]
        .find({"isPublished": True})
        .sort("createdAt", -1)
    )

    blogs = []
    async for blog in cursor:
        blog["_id"] = str(blog["_id"])  # 🔥 REQUIRED
        blogs.append(blog)

    return {
        "success": True,
        "blogs": blogs
    }


async def get_blog_by_id(blog_id: str):
    db = get_db()
    try:
        doc = await db["blogs"].find_one({"_id": ObjectId(blog_id)})
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}

    if not doc:
        return {"success": False, "message": "Blog not found"}
    return {"success": True, "blog": serialize_blog(doc)}

async def get_related_blogs(
    category: str = Query(...),
    exclude: str = Query(...),
    
):
    db = get_db()
    try:
        exclude_id = ObjectId(exclude)
        query = {
            "category": category,
            "isPublished": True,
            "_id": {"$ne": exclude_id}
        }
    except InvalidId:
        # If exclude ID is invalid, just fetch by category without exclusion
        query = {
            "category": category,
            "isPublished": True
        }

    cursor = db["blogs"].find(query).sort("createdAt", -1).limit(4)

    blogs = []
    async for blog in cursor:
        blog["_id"] = str(blog["_id"])  # REQUIRED
        blogs.append(blog)

    return {
        "success": True,
        "posts": blogs
    }

async def delete_blog_by_id(blog_id: str):
    db = get_db()
    try:
        await db["blogs"].delete_one({"_id": ObjectId(blog_id)})
        await db["comments"].delete_many({"blog": ObjectId(blog_id)})
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}
    return {"success": True, "message": "Blog deleted successfully"}

async def toggle_publish(blog_id: str):
    db = get_db()
    try:
        doc = await db["blogs"].find_one({"_id": ObjectId(blog_id)})
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}

    if not doc:
        return {"success": False, "message": "Blog not found"}
    new_val = not bool(doc.get("isPublished"))
    await db["blogs"].update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": {"isPublished": new_val, "updatedAt": datetime.utcnow().isoformat()}}
    )
    return {"success": True, "message": "Blog status updated"}

async def add_comment(blog: str, name: str, content: str):
    db = get_db()
    try:
        blog_oid = ObjectId(blog)
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}

    doc = {
        "blog": blog_oid,
        "name": name,
        "content": content,
        "isApproved": False,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    await db["comments"].insert_one(doc)
    return {"success": True, "message": "Comment added for review"}

async def get_blog_comments(blog_id: str):
    db = get_db()
    try:
        cursor = db["comments"].find({"blog": ObjectId(blog_id)}).sort("createdAt", -1)
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}
    
    comments = [serialize_comment(c) for c in await cursor.to_list(length=None)]
    return {"success": True, "comments": comments}

async def generate_content(prompt: str):
    content = await ai_generate(prompt + " Generate a blog content for this topic in simple text format --Note -> Donot include any such text just give the content")
    return {"success": True, "content": content}

async def get_topics():
    prompt = 'Give me 5 unique blog topics related to technology,startups,lifestyle,Finance. Format each topic with its title and category in this format: "Title" - *Category*. strictly give the topic thats it nothing else. No introduction text nothings just topics.'
    topics_text = await ai_generate(prompt)
    lines = [l for l in topics_text.split("\n") if l.strip()]
    parsed = []
    for topic in lines:
        parts = topic.split(" - ")
        title = parts[0].replace("**", "").strip()
        category = parts[1].replace("*", "").strip() if len(parts) > 1 else None
        parsed.append({"title": title, "category": category})
    return {"success": True, "topics": parsed}
