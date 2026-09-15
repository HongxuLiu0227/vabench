interface MarketFilterProps {
  markets: string[];
  selectedMarket: string | null;
  onMarketSelect: (market: string | null) => void;
}

export default function MarketFilter({
  markets,
  selectedMarket,
  onMarketSelect,
}: MarketFilterProps) {
  return (
    <div
      style={{
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
        minWidth: '180px',
      }}
    >
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 'bold',
          marginBottom: '10px',
          marginTop: 0,
          color: '#333',
        }}
      >
        Market Filter
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          key="all"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <input
            type="radio"
            name="market-filter"
            checked={selectedMarket === null}
            onChange={() => onMarketSelect(null)}
            style={{ marginRight: '8px' }}
          />
          All Markets
        </label>
        {markets.map((market) => (
          <label
            key={market}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <input
              type="radio"
              name="market-filter"
              checked={selectedMarket === market}
              onChange={() => onMarketSelect(market)}
              style={{ marginRight: '8px' }}
            />
            {market}
          </label>
        ))}
      </div>
    </div>
  );
}
