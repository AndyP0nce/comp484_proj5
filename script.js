// ─── GLOBAL STATE ────────────────────────────────────────────
let map;
let currentIndex = 0;
let score = 0;
let gameOver = false;
let rectangles = [];
let markers = [];
let sessionLocations = []; // the 5 randomly picked buildings for this game


// ─── ALL CSUN BUILDINGS ──────────────────────────────────────
// center = exact coordinates from Google Maps right-click
// bounds = ±0.00025 degrees around center (~25m radius)
// To add more: right-click building on maps.google.com, paste coords here

const allLocations = [
  {
    name: "The Soraya",
    center: { lat: 34.23614908356607, lng: -118.52826641405647 },
    bounds: {
      sw: { lat: 34.23589908, lng: -118.52851641 },
      ne: { lat: 34.23639908, lng: -118.52801641 }
    }
  },
  {
    name: "Bayramian Hall",
    center: { lat: 34.24045715482221, lng: -118.53095210146255 },
    bounds: {
      sw: { lat: 34.24020715, lng: -118.53120210 },
      ne: { lat: 34.24070715, lng: -118.53070210 }
    }
  },
  {
    name: "Jacaranda Hall",
    center: { lat: 34.24118496897604, lng: -118.52894029597951 },
    bounds: {
      sw: { lat: 34.24093497, lng: -118.52919030 },
      ne: { lat: 34.24143497, lng: -118.52869030 }
    }
  },
  {
    name: "Manzanita Hall",
    center: { lat: 34.23773415353637, lng: -118.53028820200092 },
    bounds: {
      sw: { lat: 34.23748415, lng: -118.53053820 },
      ne: { lat: 34.23798415, lng: -118.53003820 }
    }
  },
  {
    name: "Citrus Hall",
    center: { lat: 34.239125741901816, lng: -118.52800599553422 },
    bounds: {
      sw: { lat: 34.23887574, lng: -118.52825600 },
      ne: { lat: 34.23937574, lng: -118.52775600 }
    }
  },
  {
    name: "Bookstein Hall",
    center: { lat: 34.242037378388225, lng: -118.53079037124675 },
    bounds: {
      sw: { lat: 34.24178738, lng: -118.53104037 },
      ne: { lat: 34.24228738, lng: -118.53054037 }
    }
  },
  {
    name: "Addie Klotz Health Center",
    center: { lat: 34.238198158888636, lng: -118.52631583581126 },
    bounds: {
      sw: { lat: 34.23794816, lng: -118.52656584 },
      ne: { lat: 34.23844816, lng: -118.52606584 }
    }
  },
  {
    name: "Chaparral Hall",
    center: { lat: 34.23829088398949, lng: -118.52712160331299 },
    bounds: {
      sw: { lat: 34.23804088, lng: -118.52737160 },
      ne: { lat: 34.23854088, lng: -118.52687160 }
    }
  },
  {
    name: "Cypress Hall",
    center: { lat: 34.2365011866988, lng: -118.52968800912241 },
    bounds: {
      sw: { lat: 34.23625119, lng: -118.52993801 },
      ne: { lat: 34.23675119, lng: -118.52943801 }
    }
  },
  {
    name: "Maple Hall",
    center: { lat: 34.23768655615066, lng: -118.53124924010262 },
    bounds: {
      sw: { lat: 34.23743656, lng: -118.53149924 },
      ne: { lat: 34.23793656, lng: -118.53099924 }
    }
  },
  {
    name: "Nordhoff Hall",
    center: { lat: 34.23624566325282, lng: -118.53054893206591 },
    bounds: {
      sw: { lat: 34.23599566, lng: -118.53079893 },
      ne: { lat: 34.23649566, lng: -118.53029893 }
    }
  },
  {
    name: "University Library",
    center: { lat: 34.24004578716925, lng: -118.52931879747322 },
    bounds: {
      sw: { lat: 34.23979579, lng: -118.52956880 },
      ne: { lat: 34.24029579, lng: -118.52906880 }
    }
  },
  {
    name: "Sierra Tower",
    center: { lat: 34.238797167841746, lng: -118.53024028652132 },
    bounds: {
      sw: { lat: 34.23854717, lng: -118.53049029 },
      ne: { lat: 34.23904717, lng: -118.52999029 }
    }
  },
  {
    name: "Sierra Hall",
    center: { lat: 34.23819184243454, lng: -118.53099962215707 },
    bounds: {
      sw: { lat: 34.23794184, lng: -118.53124962 },
      ne: { lat: 34.23844184, lng: -118.53074962 }
    }
  },
  {
    name: "Sagebrush Hall",
    center: { lat: 34.242472195085185, lng: -118.52854721116795 },
    bounds: {
      sw: { lat: 34.24222220, lng: -118.52879721 },
      ne: { lat: 34.24272220, lng: -118.52829721 }
    }
  }
];


// ─── SHUFFLE ─────────────────────────────────────────────────
// Fisher-Yates shuffle — returns a new randomized copy of the array

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Always includes The Soraya + 4 random others, in a random order
function pickSessionLocations() {
  const soraya = allLocations.find(function(l) { return l.name === "The Soraya"; });
  const others = allLocations.filter(function(l) { return l.name !== "The Soraya"; });
  return shuffleArray([soraya, ...shuffleArray(others).slice(0, 4)]);
}


// ─── INIT MAP ────────────────────────────────────────────────
// Called automatically by Google Maps via callback=initMap

function initMap() {

  // Campus boundary — one block past each edge for wiggle room
  const campusBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(34.2340, -118.5360), // SW — past Nordhoff/Reseda
    new google.maps.LatLng(34.2460, -118.5220)  // NE — past Halsted/Zelzah
  );

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.2400, lng: -118.5290 },
    zoom: 16,

    // EXTRA CREDIT: Map Restrictions — keeps the player within the CSUN campus area
    // Docs: https://developers.google.com/maps/documentation/javascript/reference/map#MapRestriction
    gestureHandling: "greedy",
    restriction: {
      latLngBounds: campusBounds.toJSON(),
      strictBounds: false
    },

    // We handle double-click ourselves for the game
    disableDoubleClickZoom: true,

    // Minimal UI
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,

    // Hide every label on the map so building names don't spoil the quiz
    styles: [
      { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }
    ]
  });

  // Fit the initial view to show the whole campus
  map.fitBounds(campusBounds);

  // EXTRA CREDIT: Bicycle Layer — shows bike lanes and paths on campus
  // Docs: https://developers.google.com/maps/documentation/javascript/examples/layer-bicycling
  const bikeLayer = new google.maps.BicyclingLayer();
  bikeLayer.setMap(map);


  // Pick 5 random buildings from the full pool for this session
  sessionLocations = pickSessionLocations();

  // Initialize the score bar remaining count
  $("#score-remaining").text(sessionLocations.length);

  showPrompt();

  // Listen for double clicks — this is how the player guesses
  map.addListener("dblclick", function(event) {
    handleGuess(event.latLng);
  });
}


// ─── SHOW PROMPT ─────────────────────────────────────────────
// Updates the blue sidebar box with the current question

function showPrompt() {
  if (currentIndex >= sessionLocations.length) {
    showFinalScore();
    return;
  }
  const loc = sessionLocations[currentIndex];
  $("#current-prompt").text("Where is " + loc.name + "?");
}


// ─── CHECK IF CLICK IS INSIDE BUILDING BOUNDS ────────────────
// Returns true if the click landed inside the building rectangle
// .lat() and .lng() are methods on Google Maps LatLng objects

function isInsideBounds(latLng, bounds) {
  const lat = latLng.lat();
  const lng = latLng.lng();
  return (
    lat >= bounds.sw.lat &&
    lat <= bounds.ne.lat &&
    lng >= bounds.sw.lng &&
    lng <= bounds.ne.lng
  );
}


// ─── DRAW RECTANGLE ──────────────────────────────────────────
// Green = correct, Red = wrong — drawn over the building's real location

function drawRectangle(bounds, isCorrect) {
  const color = isCorrect ? "#00cc00" : "#ff2222";
  const rect = new google.maps.Rectangle({
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
      new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng)
    ),
    fillColor: color,
    fillOpacity: 0.4,
    strokeColor: color,
    strokeWeight: 2,
    map: map
  });
  rectangles.push(rect); // save reference so it stays visible
}



// ─── UPDATE SCORE BAR ────────────────────────────────────────
// Refreshes the live ✓ / ✗ / remaining counters after each guess

function updateScoreBar() {
  const answered = currentIndex;
  const wrong = answered - score;
  const remaining = sessionLocations.length - answered - 1;

  $("#score-correct").text(score);
  $("#score-wrong").text(wrong);
  $("#score-remaining").text(remaining < 0 ? 0 : remaining);
}


// ─── ADD TO HISTORY ──────────────────────────────────────────
// Appends the completed question + result to the sidebar log

function addToHistory(name, isCorrect) {
  const resultText = isCorrect ? "✓ Correct!" : "✗ Wrong";
  const resultClass = isCorrect ? "correct-msg" : "wrong-msg";

  const historyItem = $("<div>").addClass("history-item").text(name);
  const resultItem  = $("<div>").addClass(resultClass).text(resultText);

  $("#history").append(historyItem).append(resultItem);
}


// ─── SHOW FINAL SCORE ────────────────────────────────────────
// Called after all 5 questions — shows result + percentage + play again button

function showFinalScore() {
  gameOver = true;
  $("#current-prompt").hide();
  $("#score-bar").hide();

  const incorrect = sessionLocations.length - score;
  const pct = Math.round((score / sessionLocations.length) * 100);

  $("#final-score").html(
    score + " Correct, " + incorrect + " Incorrect<br>" +
    "<span class='pct-label'>" + pct + "%</span>" +
    "<button id='play-again'>Play Again</button>"
  );

  // Play Again — resets everything without reloading the page
  $("#play-again").on("click", function() {
    resetGame();
  });
}


// ─── RESET GAME ──────────────────────────────────────────────
// Clears all state and picks a fresh random set of 5 buildings

function resetGame() {
  // Clear all drawn rectangles from the map
  rectangles.forEach(function(r) { r.setMap(null); });
  rectangles = [];

  // Clear all markers from the map
  markers.forEach(function(m) { m.setMap(null); });
  markers = [];

  // Reset state
  currentIndex = 0;
  score = 0;
  gameOver = false;

  // Clear sidebar
  $("#history").empty();
  $("#final-score").empty();
  $("#street-view").hide();

  // Pick a new random set of 5 buildings
  sessionLocations = pickSessionLocations();

  // Reset score bar
  $("#score-correct").text(0);
  $("#score-wrong").text(0);
  $("#score-remaining").text(sessionLocations.length);
  $("#score-bar").show();
  $("#current-prompt").show();

  showPrompt();
}


// ─── HANDLE GUESS ────────────────────────────────────────────
// Main logic hub — fires on every double click

function handleGuess(latLng) {
  if (gameOver) return;

  const loc = sessionLocations[currentIndex];
  const isCorrect = isInsideBounds(latLng, loc.bounds);

  drawRectangle(loc.bounds, isCorrect);
  addToHistory(loc.name, isCorrect);
  showStreetView(loc.center);
  showMarker(loc.center, isCorrect);

  if (isCorrect) score++;

  updateScoreBar();
  currentIndex++;

  if (currentIndex >= sessionLocations.length) {
    showFinalScore();
  } else {
    showPrompt();
  }
}


// ─── SHOW MARKER ─────────────────────────────────────────────
// EXTRA CREDIT: Marker Animation — BOUNCE on correct, DROP on wrong
// Docs: https://developers.google.com/maps/documentation/javascript/markers#animate

function showMarker(center, isCorrect) {
  const marker = new google.maps.Marker({
    position: center,
    map: map,
    animation: isCorrect
      ? google.maps.Animation.BOUNCE
      : google.maps.Animation.DROP
  });
  markers.push(marker);

  if (isCorrect) {
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
  }
}


// ─── SHOW STREET VIEW (EXTRA CREDIT — STREET VIEW) ───────────
// Reveals the hidden panel and loads a panorama of the building

function showStreetView(center) {
  $("#street-view").show();
  new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    {
      position: center,
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
      disableDefaultUI: true
    }
  );
}