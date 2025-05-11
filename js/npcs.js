import { fetchAndRender, highlight } from "./utils.js";

export let allNpcs = [];

// fetch json data & render cards
export function loadNpcs() {
  fetchAndRender("json/npcs_data.json", d => allNpcs = d, renderNpcCards);
}

// convert birthdays to int for sortiing later
function birthdayToNumber(birthday) {
  const [season, dayStr] = birthday.toLowerCase().split(" ");
  const seasons = {spring: 0, summer: 100, fall:   200, autumn: 200, winter: 300};
  return (seasons[season] || 0) + parseInt(dayStr, 10);
}

// this function renders the cards
// it abides by search queries/filter searches at the same time
export function renderNpcCards(data, query = "") {
  const container = document.getElementById("npcsContainer");
  const showSpoilers = document.getElementById("showSpoilers")?.checked || false;
  const onlyDateable = document.getElementById("onlyDateable")?.checked || false;
  const lowerQuery = query.toLowerCase(); // convert search queries to lowercase
  
  container.innerHTML = ""; // clear the container

  // sort npcs by birthday
  const sortedData = Object.values(data).sort((a, b) => {
    return birthdayToNumber(a.birthday) - birthdayToNumber(b.birthday);
  });

  // loop through json data and make a card for each item
  sortedData.forEach(npc => {

    // convert json data to lowercase
    const npcName = npc.npc_name.toLowerCase();
    const birthday = npc.birthday.toLowerCase();
    const lovedGifts = npc.loved_gifts.join(",").toLowerCase();
    const likedGifts = npc.liked_gifts.join(",").toLowerCase();
    const isSpoiler = npc.spoiler ? "true" : "false";
    const isDateable = npc.dateable ? "true" : "false";

    // see if the search query nicludes any of the above
    const nameMatch = npcName.includes(lowerQuery);
    const birthdayMatch = birthday.includes(lowerQuery);
    const lovedMatch = lovedGifts.includes(lowerQuery);
    const likedMatch = likedGifts.includes(lowerQuery);

    // checking to see if there's a search query match so we can figure out which cards to make visible
    const matchesQuery = lowerQuery === "" || nameMatch || birthdayMatch || lovedMatch || likedMatch;

    // create the card
    const card = document.createElement("div");
    card.classList.add("npc-card");

    // store data attributes (can be hiidden from user)
    card.dataset.name = npcName;
    card.dataset.birthday = birthday;
    card.dataset.loved = lovedGifts;
    card.dataset.liked = likedGifts;
    card.dataset.spoiler = isSpoiler;
    card.dataset.dateable = isDateable;

    // highlight any terms the user is searchiing for
    const highlightedName = highlight(npc.npc_name, query);
    const highlightedBirthday = highlight(npc.birthday, query);
    const highlightedLoved = npc.loved_gifts.map(item => `<li>${highlight(item, query)}</li>`).join("");
    const highlightedLiked = npc.liked_gifts.map(item => `<li>${highlight(item, query)}</li>`).join("");

    // assemble the card
    card.innerHTML = `
          <h2>${highlightedName}</h2>
          <center><h3>${highlightedBirthday}</h3></center></p>
          <img src="${npc.img}">
        <div class="two-grid">
        <div>
          <strong>loved gifts:</strong>
          <ul>${highlightedLoved}</ul>
        </div>
        <div style="padding-left:16px;">
          <strong>liked gifts:</strong>
          <ul> ${highlightedLiked}</ul>
        </div>
        </div>
      `;

    // if it matches the search query and the tickboxes, it's visible
    // using let because we're reassigning multiple times
    let isVisible = matchesQuery;

    // hide non-romanceable npcs if the user has the only dateable filter ticked
    if (onlyDateable && isDateable !== "true") {
      isVisible = false;
    }
    // hide spoiler-npcs if the user has NOT ticked the spoiler checkbox
    if (!showSpoilers && npc.spoiler) {
      isVisible = false;
    }
    // hide the card if the user enters something in the search bar and it doesn't match
    if (!matchesQuery) {
      isVisible = false;
    }

    card.classList.toggle("hidden", !isVisible);

    container.appendChild(card);
  });
}