# ShareBite Deployment Guide

## 1) Backend (Render)
1. Create a new Render Web Service from this repo.
2. Set:
   - `Root Directory`: `backend-skeleton`
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
3. Add environment variables:
   - `MONGO_URI=<your MongoDB Atlas URI>`
   - `JWT_SECRET=<strong secret>`
   - `CORS_ORIGINS=https://<your-frontend>.vercel.app`
4. Deploy and verify:
   - `https://<your-render-service>.onrender.com/health`
   - Expected: `{"ok":true}`

## 2) Frontend (Vercel)
1. Open Vercel project settings.
2. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
3. Redeploy the frontend.

## 3) Troubleshooting
- If Render build fails with missing `build` script, ensure backend build command is `npm install`, not `npm run build`.
- If backend fails with Mongo parse errors, verify `MONGO_URI` and URL-encode special password characters.
- If browser shows network/CORS errors, verify `CORS_ORIGINS` includes your Vercel domain exactly.
