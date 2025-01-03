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

## Setup Instructions

### 1. Airtable Setup
1. Create an Airtable base with a table named `Links`.
2. Add two fields:
   - **Name** (Single line text)
   - **URL** (URL field or Single line text)
3. Populate the table with links you want displayed.

4. Go to **Airtable API** ([https://airtable.com/api](https://airtable.com/api)) and copy your API key and Base ID.

---

### 2. Cloudflare Worker Setup
1. In the Cloudflare dashboard, go to **Workers** and create a new Worker.
2. Replace the default code with the following:

```javascript
const AIRTABLE_API_KEY = 'YOUR_SECRET_API_KEY';
const BASE_ID = 'appngnQcIHr8WDgaT';
const TABLE_NAME = 'Links';

export default {
    async fetch(request) {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });
        
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            }
        });
    }
};
```

### 3. Frontend (HTML) Setup
1. Clone this repository.
2. Edit the `index.html` file to point to your Worker URL:
```javascript
fetch('https://worker.yourdomain.workers.dev')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('links');
        data.records.forEach(record => {
            const linkCard = document.createElement('div');
            linkCard.className = 'link-card';
            linkCard.innerHTML = `
                <a href="${record.fields.URL}" target="_blank">
                    ${record.fields.Name}
                </a>
            `;
            container.appendChild(linkCard);
        });
    });
```

---

### 4. Deploy to Cloudflare Pages
1. Go to **Pages** in Cloudflare and select **Create a Project**.
2. Connect the GitHub repository.
3. Set the build command to `npm run build` if necessary (for static sites, this may not be required).
4. Deploy and map the domain.

