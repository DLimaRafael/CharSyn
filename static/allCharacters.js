import { debounce } from "./utils.js"
const searchInput = document.getElementById("global-search")

function insertDataColumns(characterData) {
  const fragment = document.createDocumentFragment()

  const htmlContent = characterData.map(character => {
    const rarityColor = character.rarity === 4 ? 'color: #841090;' :
      character.rarity === 5 ? 'color: #FF7600;' : ''
    const rank = character.rarity === 5 ? 'S' : 'A'

    return `
  <div class="column is-6-mobile is-3-tablet is-2-desktop">
      <a href="/character/${character.id}">
        <div class="card is-unselectable is-shadowless is-radiusless">
          <div class="card-image">
            <figure class="image is-3by4">
              <img class="is-radiusless" src="/static/assets/placeholder.webp" loading="lazy">
            </figure>
          </div>
          <div class="card-content is-overlay is-flex is-flex-direction-column is-justify-content-space-between"
            style="background-color: rgba(0, 0, 0, 0.65);">
            <div class="block" style="min-height: 5.5rem">
              <p class="title is-6">${character.base_name}</p>
              <p class="subtitle is-6">${character.name}</p>
            </div>
            <div class="content is-flex is-justify-content-space-between">
              <span class="has-text-weight-bold" style="${rarityColor}">
                ${rank}
              </span>
              <span class="has-text-weight-bold is-uppercase">${character.archetype_name}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
    `;
  }).join('');

  const container = document.createElement('div')
  container.innerHTML = htmlContent

  while (container.firstChild) {
    fragment.appendChild(container.firstChild)
  }

  const targetElement = document.querySelector('#characters-container')
  if (targetElement) {
    targetElement.innerHTML = ''
    targetElement.appendChild(fragment)
  }
}

function hasData() {
  return data.length
}

function filterData(name) {
  if (name.trim() == "") {
    insertDataColumns(data)
    return
  }

  name = name.toLowerCase()
  const filteredData = data.filter(character => character.name.toLowerCase().includes(name) || character.base_name.toLowerCase().includes(name))

  insertDataColumns(filteredData)
}

const searchDebounceHandler = debounce(filterData, 300)

searchInput.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = searchInput.elements.name.value

  searchDebounceHandler(name)
})

document.addEventListener("DOMContentLoaded", () => {
  if (hasData()) {
    insertDataColumns(data)
  }
})
