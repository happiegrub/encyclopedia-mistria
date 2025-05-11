/**
 * fetch a json file
 *
 * @param {string} url      – path to your JSON.
 * @param {Function} setter – callback that saves the loaded data (e.g. d=>allBugs=d).
 * @param {Function} renderer(d, q) – your render function.
 */
export function fetchAndRender(url, setter, renderer) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`failed to load ${url}: ${res.status}`);
      return res.json();
    })
    .then(data => {
      setter(data);
      renderer(data, "");
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
  localStorage.clear();
  console.log("all local storage data cleared!");
  location.reload();
}