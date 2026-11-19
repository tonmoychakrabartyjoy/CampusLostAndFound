/* ==========================================================================
   items_browse.js - Browse / Filter Listings (client-side)
   Works with the inline handlers in items_browse.html:
     onsubmit="return filterListings(event)"
     onclick="return resetFilters(event)"
   ========================================================================== */
(function () {
    'use strict';

    // Map the <select> values to text that appears inside each card
    var CATEGORY_MAP = {
        electronics: 'electronics',
        accessories: 'bags & wallets',
        documents: 'documents',
        stationery: 'books & stationery',
        keys: 'keys'
    };

    var LOCATION_MAP = {
        'building-d': 'building d',
        'central-library': 'library',
        'cafeteria': 'cafeteria',
        'annex': 'annex',
        'basement': 'basement'
    };

    function $(id) {
        return document.getElementById(id);
    }

    // Read "Category" / "Location" text from a card's meta block
    function metaValue(card, label) {
        var rows = card.querySelectorAll('.item-meta div');
        for (var i = 0; i < rows.length; i++) {
            var text = rows[i].textContent.toLowerCase();
            if (text.indexOf(label + ':') === 0) {
                var span = rows[i].querySelector('span');
                return span ? span.textContent.toLowerCase() : '';
            }
        }
        return '';
    }

    function getNoResultsBox(grid) {
        var box = grid.querySelector('.no-results');
        if (!box) {
            box = document.createElement('div');
            box.className = 'no-results';
            box.textContent = 'No listings match your search or filters.';
            grid.appendChild(box);
        }
        return box;
    }

    function applyFilters() {
        var query = $('search') ? $('search').value.trim().toLowerCase() : '';
        var category = $('filter_category').value;
        var location = $('filter_location').value;
        var type = $('filter-type').value;

        var cards = document.querySelectorAll('.item-card');
        var visible = 0;

        cards.forEach(function (card) {
            var badge = card.querySelector('.status-badge');
            var cardType = badge ? badge.textContent.trim().toLowerCase() : '';
            var cardCategory = metaValue(card, 'category');
            var cardLocation = metaValue(card, 'location');
            var fullText = card.textContent.toLowerCase();

            var matchQuery = !query || fullText.indexOf(query) !== -1;
            var matchCategory = !category || cardCategory.indexOf(CATEGORY_MAP[category]) !== -1;
            var matchLocation = !location || cardLocation.indexOf(LOCATION_MAP[location]) !== -1;
            var matchType = !type || cardType === type;

            var show = matchQuery && matchCategory && matchLocation && matchType;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible++;
            }
        });

        // Update the "Showing N active items" counter
        var counter = document.querySelector('.catalog-stats strong');
        if (counter) {
            counter.textContent = visible;
        }

        // Empty-state message
        var grid = document.querySelector('.items-grid');
        if (grid) {
            getNoResultsBox(grid).style.display = visible === 0 ? '' : 'none';
        }
    }

    // Called by onsubmit on both the header search form and the filter form
    window.filterListings = function (event) {
        if (event) {
            event.preventDefault();
        }
        applyFilters();
        return false;
    };

    // Called by onclick on the Reset link
    window.resetFilters = function (event) {
        if (event) {
            event.preventDefault();
        }
        $('filter_category').value = '';
        $('filter_location').value = '';
        $('filter-type').value = '';
        if ($('search')) {
            $('search').value = '';
        }
        applyFilters();
        return false;
    };

    document.addEventListener('DOMContentLoaded', function () {
        // Live filtering while the admin types or changes a dropdown
        if ($('search')) {
            $('search').addEventListener('input', applyFilters);
        }
        ['filter_category', 'filter_location', 'filter-type'].forEach(function (id) {
            $(id).addEventListener('change', applyFilters);
        });

        // Support links like items_browse.html?q=bag&type=lost
        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && $('search')) {
            $('search').value = params.get('q');
        }
        if (params.get('category')) {
            $('filter_category').value = params.get('category');
        }
        if (params.get('location')) {
            $('filter_location').value = params.get('location');
        }
        if (params.get('type')) {
            $('filter-type').value = params.get('type');
        }
        applyFilters();
    });
})();
