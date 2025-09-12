import { debounce, fetchCharacters } from "./utils.js"
const searchInput = document.getElementById("matchForm")
const matchTable = document.getElementById("matchTable")
const colSpan = document.getElementById("matchTableHeader").childElementCount

let hasVoted = false

async function onMatchVote(spanElement, row, vote) {
  try {
    const data = await fetch(`/character`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ character_id, match_id: row.id, vote }),
    })

    if (!data.ok) {
      throw new Error(`HTTP Error! Status: ${data.status}`)
    }

    spanElement.textContent = Number(spanElement.textContent) + vote
    hasVoted = true
    return await data.json()

  } catch (error) {
    console.error("Error when voting: ", error)
    return []
  }
}

function insertTableRows(data) {
  const fragment = document.createDocumentFragment();

  data.forEach(row => {
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.className = "has-text-centered";
    td1.textContent = row.base_name || "";

    const td2 = document.createElement("td");
    td2.textContent = row.name || "";

    const td3 = document.createElement("td");
    td3.className = "has-text-centered";
    td3.textContent = row.archetype_name || "";

    const td4 = document.createElement("td");
    td4.className = "is-flex is-justify-content-space-between";

    const downButton = document.createElement("button");
    downButton.className = "button is-small is-danger is-outlined voting-btn";
    downButton.textContent = "Dw";

    const voteSpan = document.createElement("span");
    voteSpan.className = "has-text-centered";
    voteSpan.textContent = row.votes ?? 0;

    const upButton = document.createElement("button");
    upButton.className = "button is-small is-success is-outlined voting-btn";
    upButton.textContent = "Up";

    downButton.addEventListener("click", () => onMatchVote(voteSpan, row, -1)); // Attach event listener
    upButton.addEventListener("click", () => onMatchVote(voteSpan, row, 1)); // Attach event listener

    td4.appendChild(downButton);
    td4.appendChild(voteSpan);
    td4.appendChild(upButton);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

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
      <span class="has-text-${bulmaColor || 'grey'}">${message}</span>
    </td>
  </tr>
  `
}

function isTablePopulated() {
  return window.tableData.length
}


async function searchByName(name) {
  matchTable.innerHTML = ''
  showProgressBar()
  const includeAll = document.getElementById("include-all-filter");
  let data = []

  if (!includeAll.checked && !hasVoted) {
    data = window.tableData.filter(character => character.name.toLowerCase().includes(name.toLowerCase())
      || character.base_name.toLowerCase().includes(name.toLowerCase()))
  } else {
    data = await fetchCharacters(name, character_id, base_id, hasVoted);
  }
  hasVoted = false

  matchTable.innerHTML = ''
  if (data.length) {
    insertTableRows(data)
  } else {
    showMessage("No results were found")
  }
}

const searchDebounceHandler = debounce(searchByName, 300)

// Event Listeners
searchInput.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = searchInput.elements.name.value

  searchDebounceHandler(name)
})

document.addEventListener('DOMContentLoaded', () => {
  if (isTablePopulated()) {
    insertTableRows(tableData)
  } else {
    showMessage("No matches for this character...")
  }
})

