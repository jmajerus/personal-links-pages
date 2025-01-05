// Cloudfare worker to fetch Airtable view data
// Usage: https://<worker_url>/links?category=personal
export default {
    async fetch(request, env) {
        try {
            const { searchParams } = new URL(request.url);
            const category = searchParams.get('category') || 'personal';

            console.log(`Fetching category: ${category}`);

            // Use the secret from the env object
            const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY;
            const BASE_ID = 'appngnQcIHr8WDgaT';
            const TABLE_NAME = 'Links';

            // Check if data is in KV cache
            let links = await fetchCachedData(category, env);

            if (links) {
                console.log(`Cache hit for category: ${category}`);
            } else {
                console.log(`Cache miss. Fetching from Airtable...`);
                const airtableResponse = await fetchFromAirtable(category, AIRTABLE_API_KEY, BASE_ID, TABLE_NAME);
                
                links = airtableResponse.records;

                // **Debug Response (Here)**
                const debugResponse = {
                    message: "Airtable fetch success but no records found",
                    airtableResponse: links || "No data"
                };

                console.log(`Fetched ${links.length || 0} records from Airtable.`);
                
                // Return the debug info directly
                return new Response(JSON.stringify(debugResponse), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Cache the result in KV
                await cacheResponse(category, links, env);
                console.log(`Cached response for category: ${category}`);
            }

            // Final response if data exists
            return new Response(JSON.stringify(links), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } catch (error) {
            console.error("Worker error:", error);
            return new Response(`Internal Server Error: ${error.message}`, {
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
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
