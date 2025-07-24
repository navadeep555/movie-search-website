const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const favoritesContainer = document.getElementById("favoritesContainer");

function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesContainer.innerHTML = "";
  if (favorites.length===0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    return;
  }
  favorites.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML=`
      <img src="${movie.poster ? IMG_URL+movie.poster : 'https://via.placeholder.com/150'}" />
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
      <button onclick="removeFavorite(${movie.id})">❌ Remove</button>
    `;
    favoritesContainer.appendChild(card);
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(m => m.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

loadFavorites();

// Redirect if not logged in
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) {
  alert("Please login first!");
  window.location.href = "login.html";
}


