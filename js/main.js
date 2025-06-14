import { toggleSettings, clearAllData } from "./utils.js";
import { applyTheme, nextTheme } from "./utils.js";
import { importLocalStorage, exportLocalStorage } from "./utils.js";
import { loadNpcs, allNpcs, renderNpcCards } from "./npcs.js";
import { loadFish, allFish, renderFishCards } from "./fish.js";
import { loadBugs, allBugs, renderBugCards } from "./bugs.js";
import { loadBundles, allBundles, renderBundlesCards } from "./bundles.js";

/** 🃏 S T U F F   A B O U T   R E N D E R I N G 🃏 **/
// call the correct render function
function getPageRender(pageType, query) {
  switch (pageType) {
    case "fish":    return renderFishCards(allFish, query);
    case "bugs":    return renderBugCards(allBugs, query);
    case "npcs":    return renderNpcCards(allNpcs, query);
    case "bundles": return renderBundlesCards(allBundles, query);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    // get the page type from html
    const pageType = document.body.dataset.page;

    // universal input and buttons
    const clearButton   = document.getElementById("clearDataButton");
    const searchInput   = document.getElementById("searchInput");
    const resetButton   = document.getElementById("resetButton");

    // link to clear user localStorage data
    if (clearButton) {
        clearButton.addEventListener("click", () => {
        clearAllData();
        });
    }
    // render the cards when stuff happens in the search bar
    if (searchInput) {
        searchInput.addEventListener("input", () => {
        getPageRender(pageType, searchInput.value);
        });
    }
    // reset search & filters when the user clicks the clear all button
    if (resetButton) {
        resetButton.addEventListener("click", () => {
        resetData();       // see below
        });
    }
    
    // do more stuff based on the current page
    // load json, render page, then render again if fiilters are used
    switch (pageType) {

    case "npcs": {
        const showSpoilers = document.getElementById("showSpoilers");
        const onlyDateable = document.getElementById("onlyDateable");
        
        loadNpcs(); 

        getPageRender("npcs", searchInput?.value || "");

        [ showSpoilers, onlyDateable ]
        .forEach(el => el?.addEventListener("change", () => {
            getPageRender("npcs", searchInput?.value || "");
        }));
        break;
    }

    case "fish": {
        const seasonDropdown  = document.getElementById("seasonDropdown");
        const weatherDropdown = document.getElementById("weatherDropdown");
        const habitatDropdown = document.getElementById("habitatDropdown");
        const hideCollection  = document.getElementById("hideCollection");
        const onlyCollection  = document.getElementById("onlyCollection");

        loadFish();
        
        getPageRender("fish", searchInput?.value || "");

        [ seasonDropdown, weatherDropdown, habitatDropdown, hideCollection, onlyCollection ]
        .forEach(el => el?.addEventListener("change", () => {
            getPageRender("fish", searchInput?.value || "");
        }));
        break;
    }

    case "bugs": {
        const seasonDropdown  = document.getElementById("seasonDropdown");
        const weatherDropdown = document.getElementById("weatherDropdown");
        const hideCollection  = document.getElementById("hideCollection");
        const onlyCollection  = document.getElementById("onlyCollection");

        loadBugs();

        getPageRender("bugs", searchInput?.value || "");

        [ seasonDropdown, weatherDropdown, hideCollection, onlyCollection ]
        .forEach(el => el?.addEventListener("change", () => {
            getPageRender("bugs", searchInput?.value || "");
        }));
        break;
    }

    case "bundles": {
        const bundlesTypeDropdown = document.getElementById("bundlesTypeDropdown")
        const hideCollection = document.getElementById("hideCollection");
        const onlyCollection = document.getElementById("onlyCollection");

        loadBundles();

        getPageRender("bundles", searchInput?.value || "");

        [ bundlesTypeDropdown, hideCollection, onlyCollection ]
        .forEach(el => el?.addEventListener("change", () => {
            getPageRender("bundles", searchInput?.value || "");
        }));
        break;
    }

    default:
        console.warn("issues with pagetype:", pageType);
    }

    // this is the 'clear all' button next to the search bar
    function resetData() {
      // clear search and filter inputs
      [ "searchInput", "seasonDropdown", "weatherDropdown",
        "habitatDropdown", "bundlesTypeDropdown" ]
        .forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el.type === "checkbox") el.checked = false;
          else el.value = "";
        });
      [ "hideCollection", "onlyCollection", "showSpoilers", "onlyDateable" ]
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });

      // re-render the page
      const pageType = document.body.dataset.page;
      getPageRender(pageType, "");
    }
    
    /** 🌙 S T U F F   A B O U T   T H E M E S 🌙 **/
    const themeToggle = document.getElementById("themeToggle");

    // get whatever theme is saved or default to light
    let current = localStorage.getItem("theme") || "light";
    // apply it 
    applyTheme(current);
    // clicking on the theme link will make it switch
    themeToggle.addEventListener("click", e => {
      e.preventDefault();
      current = nextTheme(current);
      applyTheme(current);
    });

    /** ⚙️ S T U F F   A B O U T   S E T T I N G S ⚙️ **/
    // checking to see if the settings link is being clicked
    const link = document.getElementById("settingsLink");
    if (!link) return;
    link.addEventListener("click", (e) => {
      toggleSettings();     // open the div
    });

    // checking to see if export or import links are being clicked
    document.getElementById("btnExport").addEventListener("click", () => {
      const exported = exportLocalStorage();
      document.getElementById("storageExport").value = exported;
    });

    document.getElementById("btnImport").addEventListener("click", () => {
      const str = document.getElementById("storageImport").value.trim();
      if (!str) return alert("please use a valid import code!");
      const overwrite = importLocalStorage(str, true);
      alert(overwrite ? "import successful!" : "import failed.");
      if (overwrite) location.reload(); // reload the page after import
    });

});