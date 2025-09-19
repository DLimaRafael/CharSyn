import { debounce } from "./utils.js";
const searchInput = document.getElementById("global-search");
const targetElement = document.querySelector("#characters-container");

// Cache DOM elements and reuse them
const cardCache = new Map(); // Map<character.id, DOM element>

function createCardElement(character) {
  // Way too long of a function, why is it so awful to make HTML elements programmatically? orz
  if (cardCache.has(character.id)) {
    return cardCache.get(character.id).cloneNode(true); // Reuse cached element
  }

  const card = document.createElement("div");
  card.className = "column is-6-mobile is-3-tablet is-2-desktop";

  const link = document.createElement("a");
  link.href = `/character/${character.id}`;

  const cardInner = document.createElement("div");
  cardInner.className = "card is-unselectable is-shadowless is-radiusless";

  // Image
  const cardImage = document.createElement("div");
  cardImage.className = "card-image";
  const figure = document.createElement("figure");
  figure.className = "image is-3by4";
  const img = document.createElement("img");
  img.className = "is-radiusless";
  img.src = "/static/assets/placeholder.webp";
  img.loading = "lazy";
  figure.appendChild(img);
  cardImage.appendChild(figure);

  // Content
  const cardContent = document.createElement("div");
  cardContent.className =
    "card-content is-overlay is-flex is-flex-direction-column is-justify-content-space-between";
  cardContent.style.backgroundColor = "rgba(0, 0, 0, 0.65)";

  const block = document.createElement("div");
  block.className = "block";
  const title = document.createElement("p");
  title.className = "title is-6";
  title.textContent = character.base_name;
  const subtitle = document.createElement("p");
  subtitle.className = "subtitle is-6";
  subtitle.textContent = character.name;
  block.append(title, subtitle);

  const content = document.createElement("div");
  content.className = "content is-flex is-justify-content-space-between";
  const rankSpan = document.createElement("span");
  rankSpan.className = "has-text-weight-bold";
  rankSpan.style.color =
    character.rarity === 4
      ? "#841090"
      : character.rarity === 5
        ? "#FF7600"
        : "";
  rankSpan.textContent = character.rarity === 5 ? "S" : "A";
  const archetypeSpan = document.createElement("span");
  archetypeSpan.className = "has-text-weight-bold is-uppercase";
  archetypeSpan.textContent = character.archetype_name;
  content.append(rankSpan, archetypeSpan);

  cardContent.append(block, content);
  cardInner.append(cardImage, cardContent);
  link.appendChild(cardInner);
  card.appendChild(link);

  cardCache.set(character.id, card); // Cache the element
  return card;
}

function insertDataColumns(characterData) {
  if (!targetElement) {
    console.error("Target element #characters-container not found");
    return;
  }

  const fragment = document.createDocumentFragment();
  characterData.forEach((character) => {
    fragment.appendChild(createCardElement(character));
  });

  targetElement.innerHTML = "";
  targetElement.appendChild(fragment);
}

function filterData(name) {
  if (!data) {
    console.error("Data is not defined");
    return;
  }

  if (!name.trim()) {
    insertDataColumns(data);
    return;
  }

  const filteredData = data.filter(
    (character) =>
      character.name.toLowerCase().includes(name.toLowerCase()) ||
      character.base_name.toLowerCase().includes(name.toLowerCase()),
  );

  insertDataColumns(filteredData);
}

const searchDebounceHandler = debounce(filterData, 300);

searchInput.addEventListener("submit", (event) => {
  event.preventDefault();
});

searchInput.addEventListener("input", (event) => {
  const name = event.target.value;
  searchDebounceHandler(name);
});

document.addEventListener("DOMContentLoaded", () => {
  if (data.length) {
    insertDataColumns(data);
  }
});
