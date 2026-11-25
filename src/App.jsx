import { useEffect, useState } from 'react';
import { getDepartures } from './services/transitService';
import PixelVehicleIcon from './components/PixelVehicleIcon';

const REFRESH_INTERVAL_MS = 30_000; // 30초마다 갱신 (필요에 따라 조절)

export default function App() {
  const [rows, setRows] = useState([]); // 출발 시간표 초기화
  const [lastUpdated, setLastUpdated] = useState(null); // 업데이트 시간 초기화 
  const [error, setError] = useState(null); // 에러상태 초기화

  const station = 'Essen Hbf'; // 검색할 정류장 이름

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDepartures('essen', station);
        if (!cancelled) {
          setRows(data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch departures:', err);
          setError('실시간 출발 정보를 불러오지 못했습니다.');
        }
      }
    }

    // 1. 마운트 직후 즉시 1회 호출
    load();

    // 2. 이후 주기적으로 호출
    const timerId = setInterval(load, REFRESH_INTERVAL_MS);

    // 3. 클린업: 언마운트 시 인터벌 해제
    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }, [station]); // station 바뀔때마다 바뀐 station 이름으로 즉시 새 데이터가져오도록 의존성 추가

  return (
    <div>
      <h1>{station}</h1>
      {lastUpdated && (
        <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}
      {error && <p>{error}</p>}

      {rows.map((r, i) => (
        <div key={i}>
          <PixelVehicleIcon type={r.type}/>
            <span // 오른쪽 정렬
              style={{
                display: 'inline-block',
                width: '40px',
                textAlign: 'right',
              }}
            >
              {r.line}
            </span>
          {'\u00A0'.repeat(2)}{r.direction}{'\u00A0'.repeat(4)}{r.minutes === 0 ? 'Sofort' : `${r.minutes}'`}  
        </div>
      ))}
    </div>
  );
}