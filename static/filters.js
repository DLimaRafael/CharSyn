import { filterData } from "./utils.js";

function applyFilter(filter, value) {
  filters[filter] = filters[filter] === value ? "" : value;
  filterData(data, filters, searchName);
}

function createDropdownButtons(filter, container) {
  const dropdownItemBtn = document.createElement("button");
  dropdownItemBtn.classList =
    "dropdown-item filter-button has-text-weight-bold";
  dropdownItemBtn.textContent = filter[1];
  dropdownItemBtn.dataset.filterValue = filter[1];
  dropdownItemBtn.dataset.filterId = filter[0];
  container.appendChild(dropdownItemBtn);
}

function createFilterButtons(data, filterName) {
  const fragment = document.createDocumentFragment();
  const controlDiv = document.createElement("div");
  controlDiv.classList = "control dropdown is-hoverable filter";

  const triggerDiv = document.createElement("div");
  triggerDiv.classList = "dropdown-trigger";

  const filterBtn = document.createElement("button");
  filterBtn.id = `${data[0]}-button`;
  filterBtn.classList = "button filter-button";
  filterBtn.textContent = data[0];

  const filterList = document.createElement("span");
  filterList.id = `${data[0]}-filter-list`;
  filterList.classList = "has-text-grey is-size-6 filter-list ml-1";
  filterList.textContent = "";

  filterBtn.appendChild(filterList);
  triggerDiv.appendChild(filterBtn);

  const dropdownDiv = document.createElement("div");
  dropdownDiv.id = `${data[0]}-dropdown`;
  dropdownDiv.role = "menu";
  dropdownDiv.classList = "dropdown-menu";

  const dropdownContentDiv = document.createElement("div");
  dropdownContentDiv.classList = "dropdown-content";

  dropdownDiv.appendChild(dropdownContentDiv);

  data[1].forEach((filter) =>
    createDropdownButtons(filter, dropdownContentDiv),
  );

  dropdownContentDiv.addEventListener("click", (event) => {
    const button = event.target.closest(".dropdown-item");
    if (button) {
      const filterValue = button.dataset.filterValue;
      const filterId = Number(button.dataset.filterId);
      const filterListSpan = filterBtn.firstElementChild;
      applyFilter(filterName, filterId);
      let filterList = filterListSpan.textContent;
      if (filterList.includes(filterValue)) {
        filterList = "";
      } else {
        filterList = `(${filterValue})`;
      }
      filterListSpan.textContent = filterList;
    }
  });

  controlDiv.appendChild(triggerDiv);
  controlDiv.appendChild(dropdownDiv);
  fragment.appendChild(controlDiv);

  return fragment;
}

function insertFilterButtons(filters) {
  const container = document.querySelector(".filter-buttons");
  const fragment = document.createDocumentFragment();

  for (const [key, value] of Object.entries(filters)) {
    const button = createFilterButtons(value, key);
    fragment.appendChild(button);
  }

  container.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  insertFilterButtons(filterTypes);
});
