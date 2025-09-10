import { debounce } from "./utils.js"
const searchInput = document.getElementById("matchForm")
const matchTable = document.getElementById("matchTable")
const colSpan = document.getElementById("matchTableHeader").childElementCount
document.getElementById('noMatchesWarning').setAttribute('colspan', colSpan)

let prev = ""

async function fetchCharacters(searchValue) {
  try {
    const data = await fetch("/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: searchValue, character_id, base_id }),
    })

    if (!data.ok) {
      throw new Error(`HTTP Error! Status: ${data.status}`)
    }

    return await data.json()

  } catch (error) {
    console.error("Error listing characters: ", error)
    return []
  }
}

function insertTableRows(data) {
  const fragment = document.createDocumentFragment();

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.base_name || ""}</td>
      <td>${row.name || ""}</td>
      <td>${row.archetype || ""}</td>
      <td>${row.votes ?? 0}</td>
    `;

    fragment.appendChild(tr);
  });

  matchTable.appendChild(fragment);
}

function showProgressBar() {
  matchTable.innerHTML = `
    <tr id="progressBar">
      <td colspan="${colSpan}">
        <progress class="progress is-small is-link is-radiusless" max="100"></progress>
      </td>
    </tr>
  `
}

function showMessage(message, bulmaColor) {
  matchTable.innerHTML = `
  <tr>
    <td colspan=${colSpan} style="text-align: center;">
      <span class="has-text-${bulmaColor||'grey'}">${message}</span>
    </td>
  </tr>
  `
}

function isTablePopulated() {
  return !!window.tableData.length
}


async function searchByName(name) {
  matchTable.innerHTML = ''
  showProgressBar()
  const includeAll = document.querySelector('input[type="checkbox"]');
  // In the submit handler:
  let data = !includeAll.checked
    ? window.tableData.filter(character => character.name.toLowerCase().includes(name.toLowerCase()))
    : await fetchCharacters(name);

  matchTable.innerHTML = ''
  if (data.length) {
    insertTableRows(data)
  } else {
    showMessage("No results were found")
  }
}

const searchDebounceHandler = debounce(searchByName, 300)

searchInput.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = searchInput.elements.name.value

  searchDebounceHandler(name)
})
