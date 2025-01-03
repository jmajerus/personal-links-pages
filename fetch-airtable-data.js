// Cloudfare worker to fetch Airtable view data
// Replace YOUR_SECRET_API_KEY with your Airtable API key
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
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
