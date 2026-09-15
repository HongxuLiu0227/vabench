interface Props {
  zoneId?: string;
}

export function DashboardTextZone1({ zoneId }: Props) {
  return (
    <div
      data-zone-id={zoneId || '42'}
      style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        fontSize: '12px',
        lineHeight: '1.5',
        color: '#000',
      }}
    >
      We have an overview break down global game sales from 1980 to 2016. Using a stacked plot we attempt to establish if there is a dominant genre or visible trend from the data plotted. We can somewhat see that sports genre had more of a success between 2006 to 2009. Then the shooter genre took off as the dominant genre in sales. To explore this more, we dive to a more indepth break down by looking at the publishers and their sales performance.
    </div>
  );
}

export function DashboardTextZone2({ zoneId }: Props) {
  return (
    <div
      data-zone-id={zoneId || '43'}
      style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        fontSize: '12px',
        lineHeight: '1.5',
        color: '#000',
      }}
    >
      From breaking down the publishers, we know that Nintendo thrived over the other publishers between 2004 and 2008. Setting record with Wii Sports. But that dominance, did not last long until the new shooter genres took over with the Call of Duty series and other titles.
    </div>
  );
}

export function DashboardTextZone3({ zoneId }: Props) {
  return (
    <div
      data-zone-id={zoneId || '51'}
      style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        fontSize: '12px',
        lineHeight: '1.5',
        color: '#000',
      }}
    >
      We were not able to discover a definitive trend over time, but found a volatile gaming market. That changed trends rapidly without much warning and favor to publishers. Nintendo got lucky and had it's success streak for a while until more recent times. The data indicates that the shooter genre took off after the 2009 and has seen continuous popularity and success
    </div>
  );
}

export function DashboardTextZone4({ zoneId }: Props) {
  return (
    <div
      data-zone-id={zoneId || '29'}
      style={{
        padding: '10px',
        backgroundColor: '#e8e8e8',
        border: '1px solid #ccc',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
      }}
    >
      Filters located here
    </div>
  );
}
