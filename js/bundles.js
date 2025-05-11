import { fetchAndRender, highlight } from "./utils.js";

export let allBundles = [];

// fetch json data & render cards
export function loadBundles() {
  fetchAndRender("json/bundles_data.json", d => allBundles = d, renderBundlesCards);
}

// this function renders the cards
// it abides by search queries/filter searches at the same time
export function renderBundlesCards(data, query) {
  const container = document.getElementById("smallContainer");
  const bundlesTypeDropdown = document.getElementById("bundlesTypeDropdown").value.toLowerCase();
  const hideCollection = document.getElementById("hideCollection")?.checked || false;
  const onlyCollection = document.getElementById("onlyCollection")?.checked || false;
  const lowerQuery = query.toLowerCase(); // convert search queries to lowercase

  container.innerHTML = ""; // clear the container

  // loop through json data and make a card for each item
  data.forEach(categoryObj => {
    const categoryName = Object.keys(categoryObj)[0];
    const category = categoryObj[categoryName];

    /* the json data is nested an extra level (different from fish, bugs, npcs)
       we convert the object to an array so we can iterate over each entry
       ie, bundleName is 'spring forage' and bundleDetails are it's values */
    Object.entries(category).forEach(([bundleName, bundleDetails]) => {
      
      // convert json data to lowercase
      const bundleTypeData = bundleDetails.wing.toLowerCase();
      // converting each item in the array to lowercase
      const itemsData = Array.isArray(bundleDetails.items)
        ? bundleDetails.items.map(item => item.toLowerCase())
        : [];
      const itemString = itemsData.join(", ");

      // check to see if the search query matches with above
      const nameMatch = bundleName.toLowerCase().includes(lowerQuery);
      const bundleTypeMatch = bundleTypeData.includes(lowerQuery);
      const itemMatch = itemString.includes(lowerQuery);

      // checking to see if there's a match so we can figure out which cards to make visible
      const matchesQuery = lowerQuery === "" || nameMatch || bundleTypeMatch || itemMatch;

      // same as above, but for dropdown elements
      const dropdownBundleTypeMatch = bundlesTypeDropdown === "" ? true : bundleDetails.wing.toLowerCase() === bundlesTypeDropdown;

      const matchesDropdowns = dropdownBundleTypeMatch;

      // create the card
      const card = document.createElement("div");
      card.classList.add("bundle-card");
      card.dataset.name = bundleName;
      card.dataset.bundleType = bundleTypeData;

      // using let because the variable is being reassigned below
      let allChecked = true;
      let hasCheckedItems = false;

      // iterate over each bundle item and put checkboxes on them
      const itemList = itemsData.map(item => {
        // create a unique item id for each item so we can save an item's state in localStorage
        // and check if an item needs to be rendered with a ticked box
        const itemId = `bundle-${bundleName}-${item}`;
        const isChecked = localStorage.getItem(itemId) === "true";

        if (!isChecked) allChecked = false; // if the card will get the .collection-complete class later
        if (isChecked) hasCheckedItems = true;

        return `
            <li>
              <label>
                <input type="checkbox" class="item-checkbox" id="${itemId}" ${isChecked ? "checked" : ""}>
                ${highlight(item, query)}
              </label>
            </li>
          `;
      }).join(""); // convert array to single string

      // now that the itemList is created, assemble the card
      card.innerHTML = `
        <span class="wing-info">${highlight(bundleDetails.wing || "", query)}</span>
        <h3>${highlight(bundleName, query)}</h3>
        <ul>${itemList}</ul>
      `;

      // checking to see which cards are going to be displayed
      if (allChecked && itemsData.length > 0) {
        card.classList.add("collection-complete");
      } else {
        card.classList.remove("collection-complete");
      }

      let isVisible = matchesQuery && matchesDropdowns;

      if (hideCollection) {
        isVisible = isVisible && !allChecked;
      }

      if (onlyCollection) {
        isVisible = isVisible && hasCheckedItems;
      }

      card.classList.toggle("hidden", !isVisible);

      container.appendChild(card);

      // see if checkbox is being toggled
      // apply correct class=id and save the state in local storage
      card.querySelectorAll(".item-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
          const isChecked = checkbox.checked;
          localStorage.setItem(checkbox.id, isChecked);

          let allChecked = true;
          let hasCheckedItems = false;

          card.querySelectorAll(".item-checkbox").forEach(cb => {
            if (!cb.checked) allChecked = false;
            if (cb.checked) hasCheckedItems = true;
          });

          if (allChecked && itemsData.length > 0) {
            card.classList.add("collection-complete");
          } else {
            card.classList.remove("collection-complete");
          }

          let isVisible = matchesQuery && matchesDropdowns;

          if (hideCollection) {
            isVisible = isVisible && !allChecked;
          }

          if (onlyCollection) {
            isVisible = isVisible && hasCheckedItems;
          }

          card.classList.toggle("hidden", !isVisible);
        });
      });
    });
  });
}