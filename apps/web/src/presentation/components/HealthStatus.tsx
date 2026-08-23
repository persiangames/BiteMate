import { useEffect, useState } from 'react';
import type { HealthResponseDto } from '@bitemate/shared';
import { fetchHealthStatus } from '@/data/repositories/healthRepository';

type HealthState =
  | { kind: 'loading' }
  | { kind: 'success'; data: HealthResponseDto }
  | { kind: 'error'; message: string };

export function HealthStatus() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetchHealthStatus()
      .then((data) => {
        if (!cancelled) {
          setState({ kind: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return <p className="health health--loading">Checking API status…</p>;
  }

  if (state.kind === 'error') {
    return <p className="health health--error">API Status: offline ({state.message})</p>;
  }

  return <p className="health health--ok">API Status: {state.data.status}</p>;
}
