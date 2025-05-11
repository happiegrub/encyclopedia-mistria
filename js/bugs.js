import { fetchAndRender, highlight } from "./utils.js";

export let allBugs = [];

// fetch json data & render cards
export function loadBugs() {
  fetchAndRender("json/bugs_data.json", d => allBugs = d, renderBugCards);
}

// this function renders the cards
// it abides by search queries/filter searches at the same time
export function renderBugCards(data, query = "") {
  const container = document.getElementById("smallContainer");
  const seasonDropdown = document.getElementById("seasonDropdown").value.toLowerCase();
  const weatherDropdown = document.getElementById("weatherDropdown").value.toLowerCase();
  const hideCollection = document.getElementById("hideCollection")?.checked || false;
  const onlyCollection = document.getElementById("onlyCollection")?.checked || false;
  const lowerQuery = query.toLowerCase(); // convert search queries to lowercase

  container.innerHTML = ""; // clear the container

  // sort alphabetically
  const sortedData = Object.values(data).sort((a, b) => {
    return a.bug_name.toLowerCase().localeCompare(b.bug_name.toLowerCase());
  });

  // loop through json data and make a card for each item
  sortedData.forEach(bug => {
    const checkboxId = `bug-${bug.bug_name}`;
    const isChecked = localStorage.getItem(checkboxId) === "true";

    // convert json data to lowercase
    const bugName = bug.bug_name.toLowerCase();
    const rarityData = bug.rarity.toLowerCase();
    const seasonData = bug.seasons.join(", ").toLowerCase();
    const weatherData = bug.weather_types.join(", ").toLowerCase();
    const habitatData = bug.spawn_conditions.join(", ").toLowerCase();

    // see if the search query includes any of the above
    const nameMatch = bugName.includes(lowerQuery);
    const rarityMatch = rarityData.includes(lowerQuery);
    const seasonMatch = seasonData.includes(lowerQuery);
    const weatherMatch = weatherData.includes(lowerQuery);
    const habitatMatch = habitatData.includes(lowerQuery);

    // checking to see if there's a seach query match so we can figure out which cards to make visible
    const matchesQuery = lowerQuery === "" || nameMatch || rarityMatch || seasonMatch || weatherMatch || habitatMatch;

    // same as above, but for the dropdown elements
    const dropdownSeasonMatch = seasonDropdown ? bug.seasons.includes(seasonDropdown) : true;
    const dropdownWeatherMatch = weatherDropdown ? bug.weather_types.includes(weatherDropdown) : true;

    const matchesDropdowns = dropdownSeasonMatch && dropdownWeatherMatch 

    // create the card
    const card = document.createElement("div");
    card.classList.add("small-card");

    // store data attributes (can be hidden from user)
    card.dataset.name = bugName;
    card.dataset.rarity = rarityData;
    card.dataset.season = seasonData;
    card.dataset.weather = weatherData;
    card.dataset.habitat = habitatData;
    card.dataset.collected = isChecked ? "true" : "false";

    // if the user has ticked the checkbox on the card, give it this class
    if (isChecked) {
      card.classList.add("collection-complete");
    }

    // if it matches the search query and the dropdowns, it's visible
    // using let because we're reassigning multiple times
    let isVisible = matchesQuery && matchesDropdowns;
    // only show cards that are not collected if the user has hide collecton ticked
    if (hideCollection) {
      isVisible = isVisible && !isChecked;
    }
    // only show the cards that are collected if the user has only collection ticked
    if (onlyCollection) {
      isVisible = isVisible && isChecked;
    }
    // if only collection is ticked absolutely make sure collected ones are visible
    if (onlyCollection) {
      isVisible = isChecked;
    }

    // highlight any terms the user is searching for
    const highlightedName = highlight(bug.bug_name, query);
    const highlightedRarity = highlight(bug.rarity, query);
    const highlightedSeasons = bug.seasons.map(item => `<li>${highlight(item, query)}</li>`).join("");
    const highlightedWeather = bug.weather_types.map(item => `<li>${highlight(item, query)}</li>`).join("");
    
    // we're only going to list uses and habitat if there's a value in the json data
    // this is to prevent getting a bullet point without any text
    const highlightedUses = bug.uses.filter(use => use.trim() !== "").map(use => `<li>${highlight(use, query)}</li>`).join("");
    const usesSection = highlightedUses
      ? `<hr><div class="uses-section"><ul>${highlightedUses}</ul></div>`
      : "";
    const highlightedHabitat = bug.spawn_conditions.filter(use => use.trim() !== "").map(use => `<li>${highlight(use, query)}</li>`).join("");
    const habitatSection = highlightedHabitat
      ? `<div class="habitat-section"><strong>habitat:</strong><ul>${highlightedHabitat}</ul></div>`
      : "";

    // assemble the card
    card.innerHTML = `
        <label>
        <input type="checkbox" class="collected-checkbox" id="${checkboxId}" ${isChecked ? "checked" : ""}>
        <img src="${bug.img}" width="28px"><h3>${highlightedName}</h3>
        </label>
        <p><strong>sell price: ${bug.sell_price}</strong><br>
        <strong>${highlightedRarity}</strong></p>
        <hr>
        <p><strong>active hours:</strong><br>${bug.hours}</p>
        ${habitatSection}
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

      renderBugCards(data, query);  // render the cards again to reflect checkbox changes
    });

    container.appendChild(card);
  });
}