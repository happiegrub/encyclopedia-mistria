import { fetchAndRender, highlight } from "./utils.js";

export let allFish = [];

// fetch json data & render cards
export function loadFish() {
  fetchAndRender("json/fish_data.json", d => allFish = d, renderFishCards);
}

// this function renders the cards
// it abides by search queries/filter searches at the same time
export function renderFishCards(data, query = "") {
  const container = document.getElementById("smallContainer");
  const seasonDropdown = document.getElementById("seasonDropdown").value.toLowerCase();
  const weatherDropdown = document.getElementById("weatherDropdown").value.toLowerCase();
  const habitatDropdown = document.getElementById("habitatDropdown").value.toLowerCase();
  const hideCollection = document.getElementById("hideCollection")?.checked || false;
  const onlyCollection = document.getElementById("onlyCollection")?.checked || false;
  const lowerQuery = query.toLowerCase(); // convert search queries to lowercase

  container.innerHTML = ""; // clear the container

  // sort alphabetically
  const sortedData = Object.values(data).sort((a, b) => {
    return a.fish_name.toLowerCase().localeCompare(b.fish_name.toLowerCase());
  });

  // loop through json data and make a card for each item
  sortedData.forEach(fish => {
    const checkboxId = `fish-${fish.fish_name}`;
    const isChecked = localStorage.getItem(checkboxId) === "true";

    // convert json data to lowercase
    const fishName = fish.fish_name.toLowerCase();
    const rarityData = fish.rarity.toLowerCase();
    const sizeData = fish.size.toLowerCase();
    const habitatData = fish.water_type.join(", ").toLowerCase();
    const seasonData = fish.seasons.join(", ").toLowerCase();
    const weatherData = fish.weather_types.join(", ").toLowerCase();

    // check to see if the search query matches with above
    const nameMatch = fishName.includes(lowerQuery);
    const habitatMatch = habitatData.includes(lowerQuery);
    const seasonMatch = seasonData.includes(lowerQuery);
    const sizeMatch = sizeData.includes(lowerQuery);
    const weatherMatch = weatherData.includes(lowerQuery);
    const rarityMatch = rarityData.includes(lowerQuery);

    // checking to see if there's a match so we can figure out which cards to make visible
    const matchesQuery = lowerQuery === "" || nameMatch || habitatMatch || seasonMatch || sizeMatch || weatherMatch || rarityMatch;

    // same as above, but for the dropdown elements
    const dropdownSeasonMatch = seasonDropdown ? fish.seasons.includes(seasonDropdown) : true;
    const dropdownWeatherMatch = weatherDropdown ? fish.weather_types.includes(weatherDropdown) : true;
    const dropdownhabitatMatch = habitatDropdown ? fish.water_type.some(habitat => habitat.toLowerCase().includes(habitatDropdown)) : true;

    const matchesDropdowns = dropdownSeasonMatch && dropdownWeatherMatch && dropdownhabitatMatch;

    // create the card
    const card = document.createElement("div");
    card.classList.add("small-card");

    // store data attributes (can be hidden from user)
    card.dataset.name = fishName;
    card.dataset.habitat = habitatData;
    card.dataset.season = seasonData;
    card.dataset.size = sizeData;
    card.dataset.weather = weatherData;
    card.dataset.rarity = rarityData;
    card.dataset.collected = isChecked ? "true" : "false";
  
    // checking to see which cards are going to be displayed
    if (isChecked) {
      card.classList.add("collection-complete");
    }

    // using let because the variable is being reassigned multiple times
    let isVisible = matchesQuery && matchesDropdowns;

    if (hideCollection) {
      isVisible = isVisible && !isChecked;
    }

    if (onlyCollection) {
      isVisible = isVisible && isChecked;
    }

    if (onlyCollection) {
      isVisible = isChecked;
    }

    // highlight any terms the user is searching for
    const highlightedName = highlight(fish.fish_name, query);
    const highlightedRarity = highlight(fish.rarity, query);
    const highlightedSize = highlight(fish.size, query);
    const highlightedWaterType = highlight(fish.water_type.join(", "), query);
    const highlightedSeasons = fish.seasons.map(item => `<li>${highlight(item, query)}</li>`).join("");
    const highlightedWeather = fish.weather_types.map(item => `<li>${highlight(item, query)}</li>`).join("");

    const highlightedUses = fish.uses.filter(use => use.trim() !== "").map(use => `<li>${highlight(use, query)}</li>`).join("");
    const usesSection = highlightedUses
    ? `<hr><div class="uses-section"><ul>${highlightedUses}</ul></div>`
    : "";

    // assemble the card 
    card.innerHTML = `
      <label>
      <input type="checkbox" class="collected-checkbox" id="${checkboxId}" ${isChecked ? "checked" : ""}>
      <img src="${fish.img}" width="28px"><h3>${highlightedName}</h3>
      </label>
      <p><strong>sell price:</strong> ${fish.sell_price}<br>
      <strong>${highlightedRarity}</strong></p>
      <hr>
      <strong>habitat:</strong> ${highlightedWaterType}<br>
      <strong>shadow size:</strong> ${highlightedSize}<p>
      <div class="two-grid">
        <div>
          <strong>seasons:</strong>
          <ul>${highlightedSeasons}</ul>
        </div>
        <div>
          <strong>weather:</strong>
          <ul>${highlightedWeather}</ul>
        </div>
      </div>
      ${usesSection}

    `;

    // hide the card if it doesn't abide by filtering rules
    if (!isVisible) {
      card.classList.add("hidden");
    }

    // see if checkbox is being toggled
    // apply the correct class-id and save the state in local storage
    const checkbox = card.querySelector(".collected-checkbox");
    checkbox.addEventListener("change", () => {
      const isChecked = checkbox.checked;
      localStorage.setItem(checkboxId, isChecked);
      card.dataset.collected = isChecked ? "true" : "false";

      if (isChecked) {
        card.classList.add("collection-complete");
      } else {
        card.classList.remove("collection-complete");
      }

      renderFishCards(data, query);  // render the cards again to reflect checkbox changes
    });

    container.appendChild(card);
  });
}