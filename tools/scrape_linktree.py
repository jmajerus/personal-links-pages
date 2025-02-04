import requests
import csv
import sys
import re
from bs4 import BeautifulSoup

def scrape_linktree(linktree_url):
    # Fetch the HTML content
    response = requests.get(linktree_url, headers={"User-Agent": "Mozilla/5.0"})
    
    if response.status_code != 200:
        print(f"Failed to retrieve the page. HTTP Status Code: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, "html.parser")

    # Store links and their corresponding categories
    links_data = []
    current_category = None  # Start without a category

    # Step 1: Extract personal links from the social media section
    for social_link in soup.find_all("a", {"data-testid": "SocialIcon"}):
        title = social_link.get("title", "").strip()
        href = social_link["href"]
        links_data.append([title, href, "personal"])

    # Step 2: Extract categorized links from collections
    for element in soup.find_all(["h3", "a"], recursive=True):
        if element.name == "h3" and "sc-dlfnbm" in element.get("class", []):
            # Update category when encountering a new collection heading
            current_category = element.get_text(strip=True)

        elif element.name == "a" and element.get("data-testid") == "LinkButton":
            # Extract link information
            title = element.get_text(" ", strip=True) or element.get("title", "").strip()
            href = element["href"]

            # Fix duplication issue (e.g., "InstagramInstagram" → "Instagram")
            title = re.sub(r'\b(\w+)\s*\1\b', r'\1', title)

            # Assign category based on last seen collection
            category = current_category if current_category else "Uncategorized"

            # Store the link with its category
            links_data.append([title, href, category])

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
