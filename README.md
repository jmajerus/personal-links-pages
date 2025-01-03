# Airtable Link Dashboard with Cloudflare Worker Proxy

## Overview
This project creates a dynamic link dashboard powered by Airtable and hosted using Cloudflare Pages. It allows easy management of links (such as social media or portfolio URLs) via Airtable without redeploying the site. 

To avoid exposing Airtable API keys in the frontend, a Cloudflare Worker acts as a proxy, fetching data securely and passing it to the frontend.

## Features
- **Editable Links:** Update Airtable records to modify displayed links in real-time.
- **Secure API Key Handling:** Airtable API keys are hidden through a Cloudflare Worker proxy.
- **Simple Deployment:** Uses Cloudflare Pages to host the frontend and Workers to manage API requests.
- **Responsive Design:** Customizable HTML/CSS to match personal branding.

## How It Works
1. **Airtable Backend:** Links are stored in Airtable with "Name" and "URL" fields.
2. **Cloudflare Worker:** Fetches data from Airtable using the API and returns it with CORS headers.
3. **Frontend (HTML/JS):** Dynamically fetches link data from the Worker and displays it in a styled list.

## Demo
You can see the project live at: [Personal Links](https://personal-links-21x.pages.dev/)
