import { useEffect, useState } from 'react';
import { getDepartures } from './services/transitService';
import PixelVehicleIcon from './components/PixelVehicleIcon';

const REFRESH_INTERVAL_MS = 600_000; // 전체 리스트 60초마다 갱신 (필요에 따라 조절)
const PAGE_SIZE = 5; // 한 화면에 보여줄 개수
const PAGE_INTERVAL_MS = 7_000; // 7초마다 다음 5개로 전환
const MAX_MINUTES = 15; // 15분 이내 출발만 표시

const controlStyle = {
  height: '38px',
  boxSizing: 'border-box',
  border: '1px solid #555',
  borderRadius: '6px',
  backgroundColor: '#111',
  color: '#ffffff',
  fontFamily: 'inherit',
  fontSize: '15px',
  outline: 'none',
};

const buttonStyle = {
  ...controlStyle,
  padding: '0 16px',
  flexShrink: 0,
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
};

export default function App() {
  const [rows, setRows] = useState([]); // 출발 시간표 초기화
  const [lastUpdated, setLastUpdated] = useState(null); // 업데이트 시간 초기화 
  const [error, setError] = useState(null); // 에러상태 초기화
  const [pageIndex, setPageIndex] = useState(0); // 현재 5개 묶음 번호 (0부터 시작)

  const station = 'Essen Altenessen Bf'; // 검색할 정류장 이름
  //const station = 'Essen Onckenstr.'; // 검색할 정류장 이름
  //const station = 'Essen Uniklinikum'; // 검색할 정류장 이름

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
    <div
      style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          padding:
            'calc(12px + env(safe-area-inset-top)) 4px calc(20px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
        }}
        >
      <h1
        style={{
        fontSize: 'clamp(1.35rem, 6vw, 1.85rem)',
        lineHeight: 1.2,
        margin: '0 0 12px 0',
        }}
      >Wann kommt Der denn?</h1>
      {/* 검색창 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 0',
          width: '100%',
        }}
      >
        <input
          type="text"
          placeholder="Station Name..."
          style={{
           ...controlStyle,
            flex: 1,
            minWidth: 0,
            padding: '0 12px',
          }}
        />
       <button type="button" style={buttonStyle}>
          find
        </button>
      </div>
      {/* 정류장 선택 드롭다운 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 0',
          width: '100%',
        }}
      >
        <select
          defaultValue=""
          style={{
            ...controlStyle,
            flex: 1,
            minWidth: 0,
            padding: '0 10px',
          }}
        >
          <option value="" disabled>Select your station</option>
          <option value="1">항목 1</option>
          <option value="2">항목 2</option>
          <option value="3">항목 3</option>
        </select>
        <button type="button" style={buttonStyle}>
          find
        </button>
      </div>

      <br/>

      <h2>{station}</h2>
      {lastUpdated && (
        <p style={{ fontSize: '15px', margin: '0 0 6px 0' }}>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}
      {error && <p style={{ fontSize: '12px', margin: '0 0 6px 0' }}>{error}</p>}
      <div // 전광판 영역
        style={{
          width: '100%',
          aspectRatio: '3 / 1',
          minHeight: '180px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '8px 10px',
         
          display: 'flex',
          flexDirection: 'column',
          fontSize: 'clamp(16px, 3.3vw, 13px)',
        }}
      >

        {visibleRows.slice(0, 5).map((r, i) => (
          <div key={i}
            style={{
            height: '20%',
            display: 'flex',       // ⭐ 핵심: 한 줄의 모든 요소를 가로로 나란히 정렬
            alignItems: 'center',  // 세로 중앙 정렬
            gap: '8px',            // 각 요소 사이 여백 (공백 문자 대신 사용)
            }}
           >
            <PixelVehicleIcon // 차량 아이콘  
              style={{
                paddingRight: '10px',
              }}
            type={r.type}/>
              <span // 노선 번호
                style={{
                  display: 'inline-block',
                  width: '30px',
                  textAlign: 'right',
                }}
              >
                {r.line}
              </span>
            <span // 목적지
              style={{
                 flex: 1,
                  minWidth: 0,        // 핵심: 이게 있어야 옆의 출발 시간을 밀어내지 않음
                   whiteSpace: 'nowrap', // 두 줄로 줄바꿈 방지
                   overflow: 'hidden',   // 넘치는 글자 숨김
              }}
            >
              {r.direction}
            </span>
            <span // 출발 시간
              style={{
               flexShrink: 0,        // 목적지가 길어져도 너비가 찌그러지지 않음
                minWidth: '45px',     // '12 min'이나 '14:25' 같은 글자가 안 잘리도록 넉넉히 확보
                textAlign: 'right',   // 숫자 우측 정렬
                whiteSpace: 'nowrap', // 시간 줄바꿈 방지
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