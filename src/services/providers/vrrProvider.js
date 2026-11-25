// *** API 호출 + 파싱 담당

function mapVehicleType(productClass) {
  switch (Number(productClass)) {
    case 1:// S-Bahn
      return 'train';
    case 2: // U-Bahn
      return 'ubahn';
    case 4: // Straßenbahn
      return 'tram';
    case 13: // Regionalzug
      return 'train';
    case 16: // Zug (ICE)
      return 'train';
    default:
      return 'bus';
  }
}

function calcMinutesUntil(isoString) {
  if (!isoString) return 0;
  const diffMs = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export async function fetchDepartures(station) {
  const isStopId = typeof station === 'string' && station.startsWith('de:');

  const params = new URLSearchParams({
    outputFormat: 'rapidJSON',
    version: '10.4.18.18',
    type_dm: 'stop',
    name_dm: station,
    mode: 'direct',
    limit: '20',
  });

  if (!isStopId) {
    params.set('place_dm', 'Essen');
    params.set('placeState_dm', 'empty');
  }

  const response = await fetch(`/api/vrr/XML_DM_REQUEST?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`VRR API error: ${response.status}`);
  }

  const data = await response.json();
  const stopEvents = data?.stopEvents ?? [];

  return stopEvents.map((event, idx) => {
    const transport = event.transportation ?? {};
    const depTime = event.departureTimeEstimated || event.departureTimePlanned;

    return {
      id: `${transport.id ?? 'ev'}-${depTime ?? idx}-${idx}`,
      line: transport.number || transport.disassembledName || '',
      direction: transport.destination?.name || '',
      minutes: calcMinutesUntil(depTime),
      type: mapVehicleType(transport.product?.class),
    };
  });
}