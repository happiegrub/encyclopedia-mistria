// fetch the correct json file and render the page
export function fetchAndRender(url, setter, renderer) {
  // try to get the json file
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`failed to load ${url}: ${res.status}`);
      return res.json();
    })
    // store the json data in a variable (ie, allBugs)
    .then(data => {
      setter(data);
      renderer(data, ""); // then render the cards
    })
    .catch(err => console.error(err));
}

// each page uses this function to highlight search terms
export function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  }
  
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

// clear the users saved data from local storage
export function clearAllData() {
  const confirm = window.confirm (
    "this will clear your progress from all pages.\nare you sure you want to delete your data?"
  );

  if (!confirm) return;

  localStorage.clear();
  console.log("all local storage data cleared!");
  location.reload();
}

export function toggleSettings() {
  document.getElementById("settingsContainer")
          .classList.toggle("visible");
}

// export all localstorage key/values 
export function exportLocalStorage() {
  // grab the data
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }

  // make it json and make it safe (so it won't break later)
  const json = JSON.stringify(data);
  const uri = encodeURIComponent(json);

  // base64 encoding
  return btoa(uri);
}

// import the base64 blob received from export
export function importLocalStorage(base64String, overwrite = true) {
  try {
    // try to convert back into json
    const uri  = atob(base64String);
    const json = decodeURIComponent(uri);
    const data = JSON.parse(json);

    // overwrite existing data
    if (overwrite) localStorage.clear();

    // replace the data
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    return true;
  } catch (err) {
    console.error("failed to import localstorage:", err);
    return false;
  }
}