document.addEventListener('DOMContentLoaded', fetchRssFeed);

async function fetchRssFeed() {
	const rssFeedUrl = 'https://apps.kujoe.net/rss.php'; // Path to your rss.php file
	const feedContainer = document.getElementById('rssFeedContainer');
	const loadingMessage = document.getElementById('loadingMessage');
	const errorMessage = document.getElementById('errorMessage');
	const feedTitleElement = document.getElementById('feedTitle');
	const feedDescriptionElement = document.getElementById('feedDescription');
	const feedLastBuildDateElement = document.getElementById('feedLastBuildDate');

	loadingMessage.classList.remove('d-none');
	errorMessage.classList.add('d-none');
	feedContainer.innerHTML = ''; // Clear previous content

	try {
		const response = await fetch(rssFeedUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const xmlText = await response.text();
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, "application/xml");

		const channel = xmlDoc.querySelector('channel');
		if (channel) {
			feedTitleElement.textContent = channel.querySelector('title')?.textContent || 'Featured Apps RSS Feed';
			feedDescriptionElement.textContent = channel.querySelector('description')?.textContent || '';
			const lastBuildDate = channel.querySelector('lastBuildDate')?.textContent;
			if (lastBuildDate) {
				feedLastBuildDateElement.textContent = new Date(lastBuildDate).toLocaleString();
			} else {
				feedLastBuildDateElement.textContent = 'N/A';
			}
		}

		const items = xmlDoc.querySelectorAll('item');
		if (items.length === 0) {
			feedContainer.innerHTML = '<p class="text-center text-light">No featured apps found at the moment.</p>';
		} else {
			items.forEach(item => {
				const title = item.querySelector('title')?.textContent;
				const link = item.querySelector('link')?.textContent;
				// RSS description can contain CDATA with HTML, so we'll append it directly
				const descriptionCdata = item.querySelector('description')?.textContent;

				const itemDiv = document.createElement('div');
				itemDiv.className = 'col-12 col-md-6 col-lg-4 mb-4'; // Responsive columns
				itemDiv.innerHTML = `
					<div class="rss-item h-100">
						<h3>${title || 'No Title'}</h3>
						<div class="rss-description">
							${descriptionCdata || '<p>No description available.</p>'}
						</div>
						${link ? `<a href="${link}" target="_blank" class="btn btn-outline-game btn-sm mt-3">View App</a>` : ''}
					</div>
				`;
				feedContainer.appendChild(itemDiv);
			});
		}
	} catch (error) {
		console.error('Error fetching or parsing RSS feed:', error);
		errorMessage.classList.remove('d-none');
		feedTitleElement.textContent = 'Error Loading Feed';
		feedDescriptionElement.textContent = 'Could not retrieve featured apps.';
		feedLastBuildDateElement.textContent = 'N/A';
	} finally {
		loadingMessage.classList.add('d-none');
	}
}
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();

		document.querySelector(this.getAttribute('href')).scrollIntoView({
			behavior: 'smooth'
		});
	});
});

// JavaScript to populate the modal dynamically
const appDetailModal = document.getElementById('appDetailModal');
appDetailModal.addEventListener('show.bs.modal', event => {
	// Button that triggered the modal
	const button = event.relatedTarget;

	// Extract info from data-bs-* attributes
	const title = button.getAttribute('data-app-title');
	const image = button.getAttribute('data-app-image');
	const longDescription = button.getAttribute('data-app-long-description');
	const link = button.getAttribute('data-app-link');

	// Update the modal's content
	const modalTitle = appDetailModal.querySelector('#modalAppTitle');
	const modalImage = appDetailModal.querySelector('#modalAppImage');
	const modalDescription = appDetailModal.querySelector('#modalAppDescription');
	const modalLink = appDetailModal.querySelector('#modalAppLink');

	modalTitle.textContent = title;
	modalImage.src = image;
	modalDescription.textContent = longDescription;
	modalLink.href = link;
});