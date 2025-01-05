// Cloudfare worker to fetch Airtable view data
const BASE_ID = 'appngnQcIHr8WDgaT';
const TABLE_NAME = 'Links';
const CACHE_EXPIRATION = 3600;  // Cache for 1 hour

async function fetchFromAirtable(category) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=FIND('${category}', {Category}) > 0`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
    });
    return response.json();
}

async function cacheResponse(category, data) {
    await LINKS_CACHE.put(category, JSON.stringify(data), {
        expirationTtl: CACHE_EXPIRATION
    });
}

async function fetchCachedData(category) {
    const cachedData = await LINKS_CACHE.get(category);
    return cachedData ? JSON.parse(cachedData) : null;
}

export default {
    async fetch(request, env) {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'personal';

        // Use the secret from the env object
        const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY;
        const BASE_ID = 'appngnQcIHr8WDgaT';
        const TABLE_NAME = 'Links';

        // Check if data is in cache
        let links = await fetchCachedData(category);

        if (!links) {
            // Fetch from Airtable if not cached
            const airtableResponse = await fetchFromAirtable(category, AIRTABLE_API_KEY, BASE_ID, TABLE_NAME);
            links = airtableResponse.records;

            // Cache the result
            await cacheResponse(category, links);
        }

        return new Response(JSON.stringify(links), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
