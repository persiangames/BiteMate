import { lazy, Suspense, useState } from 'react';
import { RouteErrorBoundary } from '@/presentation/components/RouteErrorBoundary';
import { useI18n } from '@/presentation/context/I18nContext';
import type { EventLocationFix } from '@/presentation/components/EventLocationMap';

const EventLocationMap = lazy(() =>
  import('@/presentation/components/EventLocationMap').then((module) => ({
    default: module.EventLocationMap,
  })),
);

type EventLocationMapLazyProps = {
  eventLatitude: number | null;
  eventLongitude: number | null;
  onEventLocationChange: (fix: EventLocationFix) => void;
};

function MapFallback() {
  const { t } = useI18n();
  return (
    <div className="event-map event-map--fallback">
      <p className="hint">{t('event.map.loading')}</p>
    </div>
  );
}

function MapUnavailable() {
  const { t } = useI18n();
  return (
    <div className="event-map event-map--fallback">
      <p className="hint">{t('event.map.unavailable')}</p>
      <p className="hint">{t('event.locationPending')}</p>
    </div>
  );
}

export function EventLocationMapLazy(props: EventLocationMapLazyProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <RouteErrorBoundary
      key={retryKey}
      title="Map failed to load"
      onRetry={() => setRetryKey((value) => value + 1)}
    >
      <Suspense fallback={<MapFallback />}>
        <EventLocationMap {...props} />
      </Suspense>
    </RouteErrorBoundary>
  );
}

export { MapUnavailable };
