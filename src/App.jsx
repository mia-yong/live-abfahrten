import { useEffect, useState } from 'react';
import { getDepartures } from './services/transitService';
import PixelVehicleIcon from './components/PixelVehicleIcon';

const REFRESH_INTERVAL_MS = 600_000; // 전체 리스트 60초마다 갱신 (필요에 따라 조절)
const PAGE_SIZE = 5; // 한 화면에 보여줄 개수
const PAGE_INTERVAL_MS = 7_000; // 7초마다 다음 5개로 전환
const MAX_MINUTES = 15; // 15분 이내 출발만 표시

export default function App() {
  const [rows, setRows] = useState([]); // 출발 시간표 초기화
  const [lastUpdated, setLastUpdated] = useState(null); // 업데이트 시간 초기화 
  const [error, setError] = useState(null); // 에러상태 초기화
  const [pageIndex, setPageIndex] = useState(0); // 현재 5개 묶음 번호 (0부터 시작)

  //const station = 'Essen Altenessen Bf'; // 검색할 정류장 이름
  //const station = 'Essen Onckenstr.'; // 검색할 정류장 이름
  const station = 'Essen Uniklinikum'; // 검색할 정류장 이름

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDepartures('essen', station);
        if (!cancelled) {
          setRows(data);
          setPageIndex(0); // 새 데이터 오면 첫 페이지부터 시작
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

  // 15분 이내 시간표만 Filtering
    const filteredRows = rows.filter(
      (r) => typeof r.minutes === 'number' && r.minutes >= 0 && r.minutes <= MAX_MINUTES
    );
    const pageCount = Math.floor((filteredRows.length + PAGE_SIZE - 1) / PAGE_SIZE);

    useEffect(() => {
      if (pageCount <= 1) {
        setPageIndex(0);
        return;
      }

      const pageTimer = setInterval(() => {
        setPageIndex((prev) => (prev + 1) % pageCount);
      }, PAGE_INTERVAL_MS);

      return () => clearInterval(pageTimer);
    }, [pageCount]);

    const safePageIndex = pageCount === 0 ? 0 : pageIndex % pageCount;
    const start = safePageIndex * PAGE_SIZE;
    const visibleRows = filteredRows.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h1>Wann kommt Der denn?</h1>
      {/* 검색창 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '16px 0',
        }}
      >
        <input
          type="text"
          placeholder="Station Name..."
          style={{
            width: '220px',
            height: '38px',
            boxSizing: 'border-box',
            padding: '0 12px',

            border: '1px solid #555',
            borderRadius: '6px',

            backgroundColor: '#111',
            color: '#ffffff',

            font: 'DotGothic16',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          style={{
            height: '38px',
            padding: '0 18px',

            border: '1px solid #555',
            borderRadius: '6px',

            backgroundColor: '#111',
            color: '#ffffff',

            font: 'DotGothic16',
            fontSize: '14px',
            fontWeight: '800',

            cursor: 'pointer',
          }}
        >
          find
        </button>
      </div>
      {/* 정류장 선택 드롭다운 */}
      <div>
        <select
          defaultValue=""
          style={{
            width: '220px',
            height: '38px',
            boxSizing: 'border-box',
            padding: '0 12px',

            border: '1px solid #555',
            borderRadius: '6px',

            backgroundColor: '#111',
            color: '#ffffff',

            font: 'inherit',
            fontSize: '14px',
            outline: 'none',
            color: '#ffffff',

          }}
        >
          <option value="" disabled>Select your station</option>
          <option value="1">항목 1</option>
          <option value="2">항목 2</option>
          <option value="3">항목 3</option>
        </select>
      </div>

      <br/>

      <h2>{station}</h2>
      {lastUpdated && (
        <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}
      {error && <p>{error}</p>}
      <div
        style={{
          width: '12cm', // 임시 테두리 크기
          height: '4cm',
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '8px',
          border: '1px solid #ffffff', // 화면에서 12x7cm 경계 잘 보이게 임시 테두리
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {visibleRows.slice(0, 5).map((r, i) => (
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
            {'\u00A0'.repeat(2)}
            <span // 목적지가 고정 가로폭이 있어야 출발시간도 왼쪽 정렬이 먹힘
              style={{
                display: 'inline-block',
                width: '230px', // 내용이 고정폭 벗어날때 애니메이션 효과 주어야 함
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                verticalAlign: 'middle',
              }}
            >
              {r.direction}
            </span>
            {'\u00A0'.repeat(4)}
            <span // 왼쪽 정렬
                style={{
                display: 'inline-block',
                width: '40px',
                textAlign: 'left',
              }}
              >
            {r.minutes === 0 ? 'Sofort' : `${r.minutes}'`} 
            </span> 
          </div>
        ))}
      </div>
    </div>
  );
}