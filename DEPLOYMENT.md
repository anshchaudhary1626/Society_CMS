# SCMS Production Deployment Guide

This document outlines the step-by-step instructions for deploying the Society Complaint Management System (SCMS) backend and frontend to production platforms (e.g., Render for Backend, Vercel for Frontend).

---

## Project Overview

### What This Project Does
* Automated Ticket Routing: Implements an auto-assignment algorithm that routes new complaints to the most suitable available technician based on category specialization and active workload.
* Role-Based Dashboards: Provides customized portals for Residents (to file and review tickets), Workers (to update and resolve tasks), and Admins (to oversee metrics and manual overrides).
* Photo Evidence Integration: Connects with ImageKit CDN to support photo attachments for filed issues and resolution proof uploads.
* Operations Analytics: Feeds real-time operational graphs and metrics (average resolution speed, worker loads) directly to the Admin console.
* Secure Session Controls: Protects user profiles and credentials using HTTP-Only cookies and JWT authentication guards.

### Why It Was Required
* Traditional society management relies on manual logbooks, leading to lost tickets, slow routing times, and zero status transparency.
* Administrators lacked a data-driven method to measure average resolution times or balance work assignments fairly among staff.
* Residents had no mechanism to track whether a technician had started work or to submit service quality ratings.

---

## 1. Backend Deployment (e.g., Render.com)

Render is recommended for hosting Node.js/Express web services.

### Steps:
1. Log in to Render.com and click New -> Web Service.
2. Connect your Git repository.
3. Configure the following service settings:
   * Name: scms-backend (or custom name)
   * Region: Select the region closest to your target users (e.g., Oregon or Singapore).
   * Branch: main (or your working repository branch)
   * Root Directory: server (Important: Point to the backend server subdirectory)
   * Runtime: Node
   * Build Command: npm install
   * Start Command: node server.js
4. Expand the Advanced section and click Add Environment Variable to add your production variables:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| NODE_ENV | production | production |
| PORT | 10000 (handled automatically by Render) | 10000 |
| MONGO_URI | Your production MongoDB Atlas connection string | mongodb+srv://admin:... |
| JWT_SECRET | A secure, random 64-character hex string | (Generate a new secret) |
| IMAGEKIT_PUBLIC_KEY | Your ImageKit public key | public_... |
| IMAGEKIT_PRIVATE_KEY | Your ImageKit private key | private_... |
| IMAGEKIT_URL_ENDPOINT | Your ImageKit URL endpoint | https://ik.imagekit.io/... |
| FRONTEND_URL | The URL of your deployed Vercel frontend | https://scms-frontend.vercel.app |

5. Click Create Web Service. Once deployed, copy your backend URL (e.g., https://scms-backend.onrender.com).

---

## 2. Frontend Deployment (e.g., Vercel)

Vercel is the recommended platform for Vite/React applications.

### Steps:
1. Log in to Vercel.com and click Add New -> Project.
2. Import your Git repository.
3. Configure project settings:
   * Framework Preset: Vite (detected automatically)
   * Root Directory: client (Important: Point to the frontend client subdirectory)
   * Build Command: npm run build
   * Output Directory: dist
4. Expand the Environment Variables section and add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| VITE_API_URL | https://scms-backend.onrender.com/api | Your deployed Render backend API endpoint |
| VITE_IMAGEKIT_PUBLIC_KEY | public_... | Matching ImageKit public key |
| VITE_IMAGEKIT_URL_ENDPOINT | https://ik.imagekit.io/... | Matching ImageKit URL endpoint |

5. Click Deploy. Once complete, Vercel will provide your live URL (e.g., https://scms-frontend.vercel.app).
6. Note: Make sure to copy this URL and paste it back into your Render Backend environment variables under FRONTEND_URL so CORS accepts request credentials cleanly!

---

## 3. MongoDB IP Access List Reminder
In production, make sure to add 0.0.0.0/0 (Allow Access from Anywhere) to your MongoDB Atlas Network Access List, or whitelist the static outbound IPs of your Render web service so the database accepts connections from the deployed backend server.
