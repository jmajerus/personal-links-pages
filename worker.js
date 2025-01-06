// Cloudfare worker to fetch Airtable view data
// Usage: https://<worker_url>/links?category=personal
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const category = url.searchParams.get('category') || 'personal';
        const cacheRefresh = url.searchParams.get('cache') === 'refresh';

        const BASE_ID = env.BASE_ID || 'undefined';
        const TABLE_NAME = env.TABLE_NAME || 'undefined';
        const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY || 'undefined';

        if (BASE_ID === 'undefined' || TABLE_NAME === 'undefined' || AIRTABLE_API_KEY === 'undefined') {
            console.error('Error: Missing BASE_ID or TABLE_NAME or AIRTABLE_API_KEY');
            return new Response('Internal Server Error: Missing Airtable config.', { status: 500 });
        }

        let links = [];

        try {
            // Step 1: Refresh Cache by Deleting
            if (cacheRefresh) {
                await env.LINKS_CACHE.delete(category);
                console.log(`Cache cleared for category: ${category}`);
            }

            // Step 2: Attempt to Fetch from Cache
            console.log('Fetching from KV for category:', category);
            let cachedData = await env.LINKS_CACHE.get(category);

            if (cachedData) {
                console.log('Cache hit! Returning cached data.');
                links = JSON.parse(cachedData);
            } else {
                // Step 3: Cache Miss – Fetch from Airtable
                console.log('Cache miss. Fetching from Airtable...');
                const airtableResponse = await fetchFromAirtable(category, AIRTABLE_API_KEY, BASE_ID, TABLE_NAME);
                links = airtableResponse.records || [];

                // Step 4: Store in Cache After Fetch
                await env.LINKS_CACHE.put(category, JSON.stringify(links));
                console.log('Data written to KV after cache miss.');
            }

            // Return Final Response (Cached or Fresh Data)
            return new Response(JSON.stringify(links), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } catch (error) {
            console.error('Worker Error:', error);

            // Include detailed error info in response
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                stack: error.stack.split('\n').slice(0, 5)  // Limit stack trace length
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};


// Fetch cached data from KV
async function fetchCachedData(category, env) {
    try {
        const cacheKey = `links:${category}`;
        const cached = await env.LINKS_CACHE.get(cacheKey);

        if (cached) {
            console.log(`KV fetch successful for key: ${cacheKey}`);
            return JSON.parse(cached);
        } else {
            console.log(`No KV entry found for key: ${cacheKey}`);
        }
        return null;
    } catch (err) {
        console.error("KV fetch error:", err);
        return null;
    }
}

// Fetch data from Airtable
async function fetchFromAirtable(category, apiKey, baseId, tableName) {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=FIND('${category}', {Category}) > 0`;

    console.log(`Airtable URL: ${url}`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Access-Control-Allow-Origin': '*',  // CORS Header
        }
    });

    if (!response.ok) {
        throw new Error(`Airtable fetch failed: ${response.statusText}`);
    }

    console.log(`Airtable response status: ${response.status}`);

    return response.json();
}

// Cache data in KV for future use
async function cacheResponse(category, data, env) {
    try {
        const cacheKey = `links:${category}`;
        const expirationTtl = 3600;  // Cache for 1 hour

        await env.LINKS_CACHE.put(cacheKey, JSON.stringify(data), {
            expirationTtl
        });
        console.log(`KV put successful for key: ${cacheKey}`);
    } catch (err) {
        console.error("KV cache error:", err);
    }
}
