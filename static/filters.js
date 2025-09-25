import { filterData } from "./utils.js";

function createFilterButtons(data, filterName) {
  const controlDiv = document.createElement("div");
  controlDiv.classList = "control dropdown is-hoverable filter";

  const triggerDiv = document.createElement("div");
  triggerDiv.classList = "dropdown-trigger";

  const filterButton = document.createElement("button");
  filterButton.classList = "button filter-button";
  filterButton.textContent = data[0];

  triggerDiv.appendChild(filterButton);

  const dropdownDiv = document.createElement("div");
  dropdownDiv.id = `${data[0]}-dropdown`;
  dropdownDiv.role = "menu";
  dropdownDiv.classList = "dropdown-menu";

  const dropdownContentDiv = document.createElement("div");
  dropdownContentDiv.classList = "dropdown-content";

  dropdownDiv.appendChild(dropdownContentDiv);

  data[1].forEach((filter) => {
    const dropdownItemBtn = document.createElement("button");
    dropdownItemBtn.classList = "dropdown-item filter-button";
    dropdownItemBtn.textContent = filter[1];
    dropdownItemBtn.addEventListener("click", () =>
      applyFilter(filterName, filter),
    );
    dropdownContentDiv.appendChild(dropdownItemBtn);
  });

  controlDiv.appendChild(triggerDiv);
  controlDiv.appendChild(dropdownDiv);

  return controlDiv;
}

function insertFilterButtons(filters) {
  const container = document.querySelector(".filter-buttons");

  for (const [key, value] of Object.entries(filters)) {
    const button = createFilterButtons(value, key);
    container.appendChild(button);
  }
}

function applyFilter(filter, value) {
  filters[filter] = value[0];
  filterData(data, filters, searchName);
}

document.addEventListener("DOMContentLoaded", () => {
  insertFilterButtons(filterTypes);
});
