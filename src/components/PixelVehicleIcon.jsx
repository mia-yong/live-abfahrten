const PIXEL_MAPS = {
// U-Bahn (7x9)
  ubahn: [
'...xx...xx.....',
    '...xx...xx.....',
    '...xx...xx.....',
    '...xx...xx.....',
    '...xx...xx.....',
    '...xx...xx.....',
    '...xx...xx.....',
    '....xx.xx......',
    '.....xxx.......',
  ],

  // 트램 (13x9)
tram: [
'....xxxxx......',
    '......x........',
    '....xxxxx......',
    '...xxxxxxx.....',
    '..xx.x..x.xx...',
    '...xxxxxxx.....',
    '..xx.x..x.xx...',
    '..xx.x..x.xx...',
    '...xx...xx.....',
  ],

  // 버스 (14x7)
  bus: [
'xxxxxxxxxxxxx..',
    'xx.xx..x..xx.x.',
    'x..xx..x..xx.x.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxx.',
    '...x......x....',
    '...............',
  ],

  // 기차 (14x7)
  train: [
'xxxxxxxxxx.....',
    'xxxxxxxxx.x....',
    '....xx.x...x...',
    '....xx.x....xx.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxxx.',
    'xxxxxxxxxxxxx..',
    '...............',
  ],
};

export default function PixelVehicleIcon({
  type = 'bus',
  size = 15,
  color = '#ffb000',
}) {
    const grid = PIXEL_MAPS[type] || PIXEL_MAPS.bus;
    const rows = grid.length;
    const cols = grid[0].length;
    const height = size;
    const width = Math.round((height * cols) / rows);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${cols} ${rows}`}
            shapeRendering="crispEdges"
            aria-label={type}
            style={{ display: 'inline-block', flexShrink: 0 }}
        >
            {grid.map((row, y) =>
                row.split('').map((cell, x) =>
                cell === 'x' ? (
                    <rect
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        width={1}
                        height={1}
                        fill={color}
                    />
                ) : null
                )
            )}
        </svg>
  );
}

