export async function fetchDepartures(station) {
  const url = `/api/transit/live/essen/departures?station=${encodeURIComponent(station)}`;

  const response = await fetch(url);
  const json = await response.json();

  const list = json.data.payload.departures;

  return list.map((d) => ({
    line: d.line,
    direction: d.direction,
    minutes: d.in_minutes,
  }));
}