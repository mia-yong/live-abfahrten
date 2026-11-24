import { fetchDepartures as fetchVrr } from './providers/vrrProvider';

export async function getDepartures(region, station) {
  if (region === 'essen') {
    return fetchVrr(station);
  }

  // 아직 만들지 않은 지역
  return [];
}