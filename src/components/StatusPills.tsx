import { useEffect, useState } from 'preact/hooks';
import { cachedRate } from '../lib/rates';
import { cacheGet } from '../lib/db';
import { stamp } from '../lib/now';
import { useOnline } from '../lib/online';

// "Offline" plus the age of the cached rate and weather. Only shown when the network is off.
export function StatusPills() {
  const online = useOnline();
  const [ages, setAges] = useState<{ rate?: number; wx?: number }>({});
  useEffect(() => {
    if (online) return;
    Promise.all([cachedRate(), cacheGet('weather:tokyo'), cacheGet('weather:kyoto'), cacheGet('weather:hakone')]).then(([r, ...w]) => {
      const wx = w.map((e) => e?.at ?? 0).reduce((a, b) => Math.max(a, b), 0) || undefined;
      setAges({ rate: r?.at, wx });
    });
  }, [online]);
  if (online) return null;
  return (
    <div class="pills" role="status">
      <span class="pill off">Offline</span>
      {ages.rate && <span class="pill">rate from {stamp(ages.rate)}</span>}
      {ages.wx && <span class="pill">weather from {stamp(ages.wx)}</span>}
    </div>
  );
}
