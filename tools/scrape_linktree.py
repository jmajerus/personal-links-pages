import requests
import csv
import sys
from bs4 import BeautifulSoup

def scrape_linktree(linktree_url):
    # Fetch the HTML content
    response = requests.get(linktree_url, headers={"User-Agent": "Mozilla/5.0"})
    
    if response.status_code != 200:
        print(f"Failed to retrieve the page. HTTP Status Code: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, "html.parser")

    # Find all links
    links_data = []
    collections = {}

    # Find collections (if any)
    for collection in soup.find_all("div", class_="collection-container"):
        collection_name = collection.find("h2")
        if collection_name:
            collection_title = collection_name.text.strip()
            # Store links under the collection
            for a in collection.find_all("a", href=True):
                links_data.append([a.text.strip(), a['href'], collection_title])

    # Find standalone links outside collections
    for a in soup.find_all("a", href=True):
        # Skip links that were already added via collections
        if a['href'] not in [item[1] for item in links_data]:
            links_data.append([a.text.strip(), a['href'], "personal"])

    # Generate a CSV file
    csv_filename = "linktree_links.csv"
    with open(csv_filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "URL", "Category"])
        writer.writerows(links_data)

    print(f"CSV file '{csv_filename}' has been created successfully!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <linktree_url>")
        sys.exit(1)

    linktree_url = sys.argv[1]
    scrape_linktree(linktree_url)
