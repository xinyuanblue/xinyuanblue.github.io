// static/js/timeline-preview-modal.js

document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('#journey-timeline-preview .timeline-item');
    const storyPreviews = document.querySelectorAll('#journey-timeline-preview .story-preview');
    const storyModal = document.getElementById('storyModal');
    const modalTitle = document.getElementById('storyModalTitle');
    const modalBody = document.getElementById('storyModalBody');
    const modalClose = document.getElementById('storyModalClose');

    // --- Intersection Observer for Timeline Item Loading ---
    if ('IntersectionObserver' in window && timelineItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -25% 0px', // Trigger when item is 25% from bottom
            threshold: 0.1 // Need at least 10% visible
        };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        timelineItems.forEach(item => observer.observe(item));
    } else {
        console.warn("IntersectionObserver not supported or no timeline items. Showing all items.");
        timelineItems.forEach(item => item.classList.add('is-visible'));
    }

    // --- Modal Logic ---
    if (!storyModal || !modalTitle || !modalBody || !modalClose) {
        console.error("Modal elements not found. Story preview click will not work.");
        return;
    }

    // Function to open the modal
    function openStoryModal(titleHTML, contentHTML, titleColor) {
        // Use innerHTML to preserve icons and styling in title
        modalTitle.innerHTML = titleHTML;
        // Adjust title color if needed (already styled via CSS generally)
        // modalTitle.style.color = titleColor || '#333';
        modalBody.innerHTML = contentHTML; // Set body content (raw HTML from hidden div)
        storyModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // Function to close the modal
    function closeStoryModal() {
        storyModal.classList.remove('show');
         setTimeout(() => {
            document.body.style.overflow = '';
         }, 300); // Match CSS transition duration
    }

    // Add click listener to each story preview
    storyPreviews.forEach(preview => {
        const targetStoryId = preview.getAttribute('data-target-story');
        if (!targetStoryId) {
            console.warn("Story preview missing data-target-story attribute:", preview);
            return;
        }

        // Find the corresponding full story module using the data-story-id
        const fullStoryModule = document.querySelector(`.story-module-full[data-story-id="${targetStoryId}"]`);
        if (!fullStoryModule) {
            console.warn("Could not find full story module with ID:", targetStoryId);
            // Optionally disable the preview click
            preview.style.cursor = 'default';
            preview.onclick = null;
            return;
        }

        const storyTitleElement = fullStoryModule.querySelector('h4'); // Get title element
        if (!storyTitleElement) {
             console.warn("Could not find h4 title in full story module:", targetStoryId);
             return; // Skip if title element missing
        }

        // Prepare data for the modal
        const storyTitleHTML = storyTitleElement.innerHTML; // Get title HTML including icon
        const titleColor = window.getComputedStyle(storyTitleElement).color; // Get computed color
        // Clone the content paragraphs to avoid modifying the hidden original
        const storyContentHTML = Array.from(fullStoryModule.querySelectorAll('p'))
                                     .map(p => p.outerHTML) // Get HTML of each paragraph
                                     .join(''); // Join them together

        preview.addEventListener('click', (event) => {
             event.stopPropagation(); // Prevent potential parent clicks if nested
             openStoryModal(storyTitleHTML, storyContentHTML, titleColor);
        });
    });

    // Add listeners to close the modal
    modalClose.addEventListener('click', closeStoryModal);
    storyModal.addEventListener('click', function(event) {
        if (event.target === storyModal) {
            closeStoryModal();
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && storyModal.classList.contains('show')) {
            closeStoryModal();
        }
    });

});