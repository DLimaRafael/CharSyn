/* Render charts and populate pair tables */

function buildArchetypeChart(ctx, data) {
  const labels = data.map((d) => d.archetype);
  const counts = data.map((d) => d.count);

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Characters",
          data: counts,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
}

function buildRarityChart(ctx, data) {
  // sort rarities descending for predictable palette
  const sorted = data.slice().sort((a, b) => b.rarity - a.rarity);
  const labels = sorted.map((d) => `${d.rarity}*`);
  const counts = sorted.map((d) => d.count);

  const colors = ["#FF7600", "#841090"];

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: "transparent",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function populatePairsTable(bodyId, pairs) {
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = "";

  if (!pairs || pairs.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.className = "has-text-centered";
    td.textContent = "No pairs to show";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  pairs.forEach((p) => {
    const tr = document.createElement("tr");

    const pairCell = document.createElement("td");
    pairCell.textContent = `[${p.char_a_base_name}] ${p.char_a_name} × [${p.char_b_base_name}] ${p.char_b_name}`;

    const votesCell = document.createElement("td");
    votesCell.className = "has-text-right";
    votesCell.textContent = p.votes;

    tr.appendChild(pairCell);
    tr.appendChild(votesCell);
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const aCtx = document.getElementById("archetypeChart").getContext("2d");
  const rCtx = document.getElementById("rarityChart").getContext("2d");

  try {
    buildArchetypeChart(aCtx, archetypeData || []);
    buildRarityChart(rCtx, rarityData || []);
  } catch (err) {
    console.error("Error building charts", err);
  }

  populatePairsTable("topPairsBody", topPairs || []);
  populatePairsTable("bottomPairsBody", bottomPairs || []);
});
