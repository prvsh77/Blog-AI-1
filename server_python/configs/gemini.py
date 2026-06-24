# configs/gemini.py

import os
from google import genai  # Official import for the latest SDK
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key
api_key = os.getenv("GEMINI_API_KEY")

client = None
if api_key and api_key.strip():
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")

# Use the latest fast & efficient model
model_name = "gemini-2.5-flash"

async def generate_content(prompt: str) -> str:
    if not client:
        # Fallback to local mock content
        if "Give me 5 unique blog topics" in prompt:
            return """Building in Public: The New Startup Superpower - Startups
Why Micro-SaaS is the Best Way to Bootstrap in 2026 - Technology
The Art of Slow Living in a Fast-Paced Digital World - Lifestyle
Understanding Decentralized Finance (DeFi) in Plain English - Finance
Maximizing Productivity: Clean Desk, Clear Mind - Lifestyle"""
        else:
            topic = prompt.split(" Generate a blog")[0] if " Generate a blog" in prompt else prompt
            return f"""<h1>{topic}</h1>
<p>In today's fast-paced world, "{topic}" has become a critical topic of discussion. Whether you are an industry professional, a bootstrapping entrepreneur, or simply curious, understanding the core concepts of this subject is essential for staying ahead.</p>
<h2>Key Takeaways</h2>
<ul>
  <li><strong>Innovation:</strong> Adapting to new paradigms and workflows allows for rapid growth.</li>
  <li><strong>Consistency:</strong> Regular execution and small incremental updates yield significant long-term results.</li>
  <li><strong>Quality:</strong> Focusing on value creation builds trust and a loyal community.</li>
</ul>
<p>Ultimately, the key is to stay curious, keep learning, and apply these insights to your daily projects. By embracing these ideas, you will unlock new opportunities for personal and professional growth.</p>"""

    try:
        # Use the async client: client.aio.models
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=prompt  # Can be str, list[Part], etc.
        )
        return response.text.strip() if response.text else "No response generated."
    except Exception as e:
        return f"Gemini error: {str(e)}"