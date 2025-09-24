export async function fetchCharacters(
  name = "",
  character_id = 0,
  base_id = 0,
  is_matching = false,
) {
  try {
    const data = await fetch("/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, character_id, base_id, is_matching }),
    });

    if (!data.ok) {
      throw new Error(`HTTP Error! Status: ${data.status}`);
    }

    return await data.json();
  } catch (error) {
    console.error("Error listing characters: ", error);
    return [];
  }
}

export function filterData(data, filters) {
  for (const [key, value] of filters) {
    data = data.filter((character) => character[key] === value);
  }

  return data;
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
