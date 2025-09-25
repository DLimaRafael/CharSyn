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

let insertFunction = () => {};
export function filterData(data, filters, name) {
  for (const [key, value] of Object.entries(filters)) {
    data = value ? data.filter((character) => character[key] === value) : data;
  }

  if (name?.trim()) {
    data = data.filter((character) => {
      return (
        character.name.toLowerCase().includes(name.toLowerCase()) ||
        character.base_name.toLowerCase().includes(name.toLowerCase())
      );
    });
  }

  insertFunction(data);
}

export function defineInsertFn(insertFn) {
  insertFunction = insertFn;
}
