// Handle the search input and send the query to the server
function searchIngredients() {
  const searchTerm = document.getElementById('search-input').value.trim();

  if (!searchTerm) {
    alert('Please enter an ingredient to search.');
    return;
  }

  // Redirect to results page with the search query
  window.location.href = `results.html?search=${encodeURIComponent(searchTerm)}`;
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', searchIngredients);
