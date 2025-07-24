const API_KEY = '41841ee6a910d3d828cfaf382bdf8699';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Elements
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// Close modal handlers
closeModal.onclick = () => closeAndClearModal();
window.onclick = e => { if (e.target === modal) closeAndClearModal(); };
function closeAndClearModal() {
  modal.style.display = "none";
  modalBody.innerHTML = "";
}

// Update auth link on load
document.addEventListener("DOMContentLoaded", () => {
  updateAuthLink();

  // Load sections
  loadSection('/trending/movie/week', 'trending');
  loadSection('/movie/popular', 'popular');
  loadSection('/discover/movie', 'hollywood', '&with_original_language=en');
  loadSection('/discover/movie', 'bollywood', '&with_original_language=hi');
  loadSection('/discover/movie', 'tollywood', '&with_original_language=te');
  loadSection('/discover/movie', 'kollywood', '&with_original_language=ta');
  loadSection('/discover/movie', 'mollywood', '&with_original_language=ml');
  loadSection('/discover/movie', 'sandalwood', '&with_original_language=kn');
  loadSection('/discover/movie', 'animes', '&with_genres=16');
  loadSection('/movie/now_playing', 'latest');
});

function updateAuthLink() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const authLink = document.getElementById("authLink");
  authLink.innerHTML = user
    ? '<a href="#" onclick="logout()">Logout</a>'
    : '<a href="login.html">Login</a>';
}

function logout() {
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("loggedInUser");
  alert("You have been logged out!");
  location.reload();
}

// Load movies for a section
async function loadSection(path, containerId, extra = '') {
  const url = `${BASE_URL}${path}?api_key=${API_KEY}&language=en-US${extra}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results, containerId);
  } catch (err) {
    console.error(err);
    document.getElementById(containerId).innerHTML = "<p>Error loading movies.</p>";
  }
}

// Display movie cards
function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.poster_path ? IMG_URL+movie.poster_path : 'https://via.placeholder.com/150'}" alt="${movie.title}" />
      <h4>${movie.title}</h4>
      <button onclick="addToFavorites(${movie.id}, '${escapeQuotes(movie.title)}', '${movie.release_date ? movie.release_date.slice(0,4):''}', '${movie.poster_path}')">⭐</button>
    `;
    card.onclick = (e) => {
      if (!e.target.closest('button')) showMovieDetails(movie.id);
    };
    container.appendChild(card);
  });
}

// Escape single quotes in title
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// Show movie details (requires login)
async function showMovieDetails(id) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    alert("⚠️ Please login to watch the trailer!");
    window.location.href = "login.html";
    return;
  }
  try {
    const [detailsRes, videoRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`)
    ]);
    const details = await detailsRes.json();
    const videos = await videoRes.json();
    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    modalBody.innerHTML = `
      <h2>${details.title}</h2>
      <p>${details.overview}</p>
      ${trailer ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : '<p>Trailer not available</p>'}
    `;
    modal.style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Failed to load movie details.");
  }
}

// Add to favorites
function addToFavorites(id, title, year, posterPath) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.find(m => m.id === id)) {
    favorites.push({ id, title, year, poster: posterPath });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${title} added to favorites!`);
  } else {
    alert("Already in favorites!");
  }
}

// Search movies
async function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      displayMovies(data.results, 'searchResults');
    } else {
      document.getElementById('searchResults').innerHTML = "<p>No movies found.</p>";
    }
  } catch (err) {
    console.error(err);
    document.getElementById('searchResults').innerHTML = "<p>Error loading search results.</p>";
  }
}
