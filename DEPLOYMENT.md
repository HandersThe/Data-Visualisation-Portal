# Deployment Guide - Data Visualization Portal

## Prerequisites

Before deploying, ensure you have:
- ✅ A GitHub account
- ✅ Git installed locally
- ✅ Firebase project configured with Auth and Firestore
- ✅ All environment variables in your `.env` file

---

## Step 1: Prepare for Deployment

### 1.1 Verify Build Works Locally

```bash
npm run build
```

The build should complete successfully and create a `dist/` folder.

### 1.2 Create `.gitignore` (Already Done)

Ensure your `.gitignore` includes:
```
node_modules/
dist/
.env
.pixi
pixi.lock
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git (If Not Already Done)

```bash
git init
git add .
git commit -m "Initial commit - Data Visualization Portal"
```

### 2.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Name it: `data-visualization-portal`
4. Leave it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README
6. Click **Create repository**

### 2.3 Push to GitHub

Copy the commands from GitHub (replace with your actual repo URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/data-visualization-portal.git
git branch -M main
git push -u origin main
```

---

## Option A: Deploy to Vercel (Recommended)

### Step 1: Sign Up / Sign In

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **Add New...** → **Project**
2. Find your `data-visualization-portal` repository
3. Click **Import**

### Step 3: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables

This is **CRITICAL**. Click **Environment Variables** and add each one from your `.env` file:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

**Important:** Add these for **Production**, **Preview**, and **Development** environments.

### Step 5: Deploy

1. Click **Deploy**
2. Wait 1-2 minutes
3. You'll get a URL like: `https://data-visualization-portal.vercel.app`

### Step 6: Update Firebase Settings

1. Go to Firebase Console → **Authentication** → **Settings**
2. Under **Authorized domains**, add your Vercel domain:
   ```
   data-visualization-portal.vercel.app
   ```

### ✅ Done! Your app is live!

---

## Option B: Deploy to Netlify

### Step 1: Sign Up / Sign In

1. Go to [netlify.com](https://netlify.com)
2. Click **Sign up** or **Log in**
3. Choose **GitHub** login

### Step 2: Import Project

1. Click **Add new site** → **Import an existing project**
2. Choose **GitHub**
3. Select your `data-visualization-portal` repository

### Step 3: Configure Build Settings

- **Branch to deploy:** `main`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Step 4: Add Environment Variables

1. Click **Show advanced** → **New variable**
2. Add each variable from your `.env` file (same as Vercel above)

### Step 5: Deploy

1. Click **Deploy site**
2. Wait 1-2 minutes
3. You'll get a URL like: `https://random-name.netlify.app`
4. You can customize the domain in **Site settings** → **Change site name**

### Step 6: Update Firebase Settings

Add your Netlify domain to Firebase authorized domains (same as Vercel Step 6).

---

## Post-Deployment Checklist

After deployment:

- [ ] Test login/signup
- [ ] Upload a dataset as Admin
- [ ] View data as regular user
- [ ] Check all features work on mobile
- [ ] Share the link with testers

---

## Troubleshooting

### Build Fails

**Error:** Build command failed
- Check that all dependencies are in `package.json`
- Verify build works locally with `npm run build`

### White Screen / Blank Page

**Fix:** Check browser console for errors
- Usually means Firebase env variables are missing
- Verify all `VITE_FIREBASE_*` variables are set

### "Firebase: Error (auth/unauthorized-domain)"

**Fix:** Add your deployment domain to Firebase
- Firebase Console → Authentication → Settings → Authorized domains

### Data Not Loading

**Fix:** Check Firestore rules are deployed
- Copy rules from `firestore.rules`
- Paste in Firebase Console → Firestore → Rules → Publish

---

## Custom Domain (Optional)

### On Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain (e.g., `myapp.com`)
3. Follow DNS configuration instructions

### On Netlify:
1. Go to **Domain settings** → **Add custom domain**
2. Follow DNS configuration instructions

---

## Continuous Deployment

Good news! Both Vercel and Netlify automatically redeploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Updated feature"
git push

# Vercel/Netlify will auto-deploy!
```

---

## Cost

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for this project

**Netlify Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- 300 build minutes/month

Both are completely free for this use case! 🎉
