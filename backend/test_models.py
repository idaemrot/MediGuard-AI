from huggingface_hub import InferenceClient
import os

token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

models = [
    "google/gemma-2-2b-it",
    "meta-llama/Llama-3.2-1B-Instruct",
    "Qwen/Qwen2.5-1.5B-Instruct",
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    "microsoft/Phi-3.5-mini-instruct",
]

for model in models:
    try:
        client = InferenceClient(
            base_url=f"https://router.huggingface.co/hf-inference/models/{model}/v1",
            token=token,
        )
        response = client.chat_completion(
            model=model,
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10,
        )
        print(f"✅ WORKS: {model}")
        break
    except Exception as e:
        print(f"❌ FAIL: {model} -> {str(e)[:80]}")