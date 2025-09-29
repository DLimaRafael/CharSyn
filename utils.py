def calculate_votes(matches: list, character_id: int) -> dict:
    votes: dict = {}

    for match in matches:
        index = (
            match.match_id if match.character_id == character_id else match.character_id
        )
        votes[index] = match.votes
    return votes
