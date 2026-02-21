# Deployment Guide

## Frontend (React + Vite)
1. Connect your GitHub repo to **Vercel**.
2. Set the Framework Preset to **Vite**.
3. Add Environment Variable:
   - `VITE_API_URL`: The URL of your deployed backend.

## Backend (FastAPI)
1. Deploy to **Render** or **Railway** as a "Web Service".
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python main.py`
5. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq Cloud API key.
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`).

## Data & Models
- Ensure `backend/models/*.sav` and `backend/chatbot/vectorstores/` are included in your git push.