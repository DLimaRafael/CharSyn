// Match search functionality
const characters = '{{ characters }}'
const searchInput = document.getElementById("matchForm")
searchInput.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("matchSearchInput").value;  
  const unmatchedWithName = await fetch("/search", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({ name }),
  })

  const data = await unmatchedWithName.json()
  console.log(data)

  
})
