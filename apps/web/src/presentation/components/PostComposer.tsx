import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { geocodeCity, searchPlaces, type PlaceHit } from '@/data/geo/geocode';
import { filterCountries, filterCities, searchWorldCities } from '@/data/geo/world';
import { countrySelectOptions, formatPlace, localizeCity, localizeCountry } from '@/data/localize';
import { ApiError } from '@/data/api/client';
import { getAccessToken } from '@/data/api/sessionBridge';
import { uploadMedia } from '@/data/api/uploadClient';
import { isDemoAccessToken } from '@/data/demo/demoSession';
import { createPost } from '@/data/repositories/feedRepository';
import { ImageCropModal } from '@/presentation/components/ImageCropModal';
import { LocationPickerMap } from '@/presentation/components/LocationPickerMap';
import { PeopleTagPicker, type SelectedTag } from '@/presentation/components/PeopleTagPicker';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { UploadProgressBar } from '@/presentation/components/UploadProgressBar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDeviceLocation } from '@/presentation/context/DeviceLocationContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { MAX_CLIP_SECONDS, preparePostMedia } from '@/utils/prepareMedia';
import { normalizeMediaUrlForStorage } from '@/utils/mediaUrl';
import type { PostDto } from '@bitemate/shared';

type PostComposerProps = {
  onPublished?: (post: PostDto) => void;
};

function buildLocationLabel(
  locale: string,
  country: string,
  city: string,
  neighborhood: string | null,
): string | undefined {
  const place = formatPlace(city || null, country || null, locale);
  const parts = [neighborhood, place].filter(Boolean);
  const label = parts.join(' · ').trim();
  return label ? label.slice(0, 120) : undefined;
}

function placeKey(country: string, city: string): string {
  return `${country}|${city}`;
}

export function PostComposer({ onPublished }: PostComposerProps) {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const gps = useDeviceLocation();
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const [caption, setCaption] = useState('');
  const [peopleTags, setPeopleTags] = useState<SelectedTag[]>([]);
  const [restaurantTag, setRestaurantTag] = useState('');
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(user?.liveLatitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(user?.liveLongitude ?? null);
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [remoteCities, setRemoteCities] = useState<Array<{ value: string; label: string }>>([]);
  const [file, setFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const remoteHits = useRef(new Map<string, PlaceHit>());
  const citySearchTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (citySearchTimer.current) {
        window.clearTimeout(citySearchTimer.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const countryOptions = useMemo(
    () =>
      filterCountries(countryQuery).map((record) => ({
        value: record.name,
        label: localizeCountry(record.name, locale),
      })),
    [countryQuery, locale],
  );

  const cityOptions = useMemo(() => {
    if (!country) {
      return [];
    }
    return filterCities(country, cityQuery).map((name) => ({
      value: name,
      label: localizeCity(name, locale, country),
    }));
  }, [country, cityQuery, locale]);

  const catalogCityExtras = useMemo(() => {
    const needle = cityQuery.trim();
    if (country || needle.length < 1) {
      return [];
    }
    return searchWorldCities(needle, 80).map((hit) => ({
      value: placeKey(hit.country, hit.city),
      label: `${localizeCity(hit.city, locale, hit.country)} · ${localizeCountry(hit.country, locale)}`,
    }));
  }, [country, cityQuery, locale]);

  useEffect(() => {
    if (latitude != null || longitude != null || !gps.fix) {
      return;
    }
    setLatitude(gps.fix.latitude);
    setLongitude(gps.fix.longitude);
  }, [gps.fix, latitude, longitude]);

  function setPreview(next: File | null, kind: 'IMAGE' | 'VIDEO' | null) {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return next ? URL.createObjectURL(next) : null;
    });
    setFile(next);
    setMediaKind(kind);
  }

  async function handleFileChange(selected: File | null) {
    setError(null);
    setSaved(false);
    if (!selected) {
      setPreview(null, null);
      return;
    }

    if (selected.type.startsWith('video/')) {
      try {
        const prepared = await preparePostMedia(selected);
        setPreview(prepared.file, 'VIDEO');
      } catch (err) {
        setPreview(null, null);
        setError(err instanceof Error ? err.message : t('post.videoFailed'));
      }
      return;
    }

    if (selected.type.startsWith('image/')) {
      setCropFile(selected);
      return;
    }

    setError(t('post.chooseMedia'));
  }

  function openMediaPicker(mode: 'any' | 'image' | 'video') {
    const input = mediaInputRef.current;
    if (!input) {
      return;
    }
    if (mode === 'image') {
      input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    } else if (mode === 'video') {
      input.accept = 'video/mp4,video/webm,video/quicktime';
    } else {
      input.accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
    }
    input.click();
  }

  function applyPlace(hit: PlaceHit) {
    remoteHits.current.set(placeKey(hit.country, hit.city), hit);
    setCountry(hit.country);
    setCity(hit.city);
    setLatitude(hit.latitude);
    setLongitude(hit.longitude);
  }

  function scheduleCitySearch(query: string) {
    setCityQuery(query);
    if (citySearchTimer.current) {
      window.clearTimeout(citySearchTimer.current);
    }

    citySearchTimer.current = window.setTimeout(() => {
      const needle = query.trim();
      if (!country && needle.length >= 1) {
        setRemoteCities(
          searchWorldCities(needle, 80).map((hit) => ({
            value: placeKey(hit.country, hit.city),
            label: `${localizeCity(hit.city, locale, hit.country)} · ${localizeCountry(hit.country, locale)}`,
          })),
        );
      } else if (country && needle.length >= 1) {
        setRemoteCities(
          filterCities(country, needle).map((name) => ({
            value: name,
            label: localizeCity(name, locale, country),
          })),
        );
      } else {
        setRemoteCities([]);
      }

      if (needle.length < 2) {
        return;
      }

      void searchPlaces(needle, country || undefined)
        .then((hits) => {
          for (const hit of hits) {
            remoteHits.current.set(placeKey(hit.country, hit.city), hit);
          }
          const remoteOptions = hits.map((hit) => ({
            value: placeKey(hit.country, hit.city),
            label: country ? hit.city : `${hit.city} · ${localizeCountry(hit.country, locale)}`,
          }));
          setRemoteCities((current) => {
            const seen = new Set(current.map((item) => item.value));
            const merged = [...current];
            for (const option of remoteOptions) {
              if (!seen.has(option.value)) {
                seen.add(option.value);
                merged.push(option);
              }
            }
            return merged.slice(0, 120);
          });
        })
        .catch(() => undefined);
    }, 320);
  }

  async function handleCityChange(nextValue: string) {
    if (nextValue.includes('|')) {
      const hit = remoteHits.current.get(nextValue);
      if (hit) {
        applyPlace(hit);
        return;
      }
      const [nextCountry, nextCity] = nextValue.split('|');
      if (nextCountry && nextCity) {
        setCountry(nextCountry);
        setCity(nextCity);
        const coords = await geocodeCity(nextCountry, nextCity).catch(() => null);
        if (coords) {
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
        }
      }
      return;
    }

    const hit = country ? remoteHits.current.get(placeKey(country, nextValue)) : undefined;
    if (hit) {
      applyPlace(hit);
      return;
    }

    setCity(nextValue);
    if (!country) {
      return;
    }
    const coords = await geocodeCity(country, nextValue).catch(() => null);
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (cropFile) {
      setError(t('crop.wait'));
      return;
    }
    if (isDemoAccessToken(accessToken)) {
      setError(t('post.demoBlocked'));
      return;
    }
    if (!accessToken || !file) {
      setError(t('post.chooseMedia'));
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);
    setUploadProgress(0);
    setUploadLabel(t('post.preparing'));

    try {
      const sessionToken = getAccessToken() ?? accessToken;
      const prepared = await preparePostMedia(file);
      let thumbnailUrl: string | undefined;
      let uploaded: Awaited<ReturnType<typeof uploadMedia>>;

      if (prepared.poster) {
        setUploadLabel(t('post.uploading'));
        const [posterUpload, mainUpload] = await Promise.all([
          uploadMedia(sessionToken, prepared.poster, (percent) => {
            setUploadProgress(Math.round(percent * 0.2));
          }),
          uploadMedia(getAccessToken() ?? sessionToken, prepared.file, (percent) => {
            setUploadProgress(20 + Math.round(percent * 0.7));
          }),
        ]);
        thumbnailUrl = normalizeMediaUrlForStorage(posterUpload.mediaUrl);
        uploaded = mainUpload;
      } else {
        setUploadLabel(t('post.uploading'));
        uploaded = await uploadMedia(getAccessToken() ?? sessionToken, prepared.file, (percent) => {
          setUploadProgress(Math.round(percent * 0.9));
        });
      }

      setUploadLabel(t('post.publishing'));
      setUploadProgress(92);

      const publishToken = getAccessToken() ?? sessionToken;
      const created = await createPost(publishToken, {
        caption: caption || undefined,
        mediaType: uploaded.mediaType,
        mediaUrl: normalizeMediaUrlForStorage(uploaded.mediaUrl),
        thumbnailUrl:
          thumbnailUrl ??
          (uploaded.thumbnailUrl ? normalizeMediaUrlForStorage(uploaded.thumbnailUrl) : undefined),
        restaurantTag: restaurantTag.trim() || undefined,
        tags: peopleTags.map((tag) => ({ userId: tag.userId, role: tag.role })),
        locationLabel: buildLocationLabel(locale, country, city, neighborhood),
        locationLat: latitude ?? undefined,
        locationLng: longitude ?? undefined,
      });

      setUploadProgress(100);
      setUploadLabel(null);
      setSaved(true);
      onPublished?.(created);
    } catch (err) {
      setUploadLabel(null);
      setUploadProgress(0);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(localizeError(t, err, 'post.failed'));
      }
    } finally {
      setLoading(false);
    }
  }

  const placePreview = buildLocationLabel(locale, country, city, neighborhood);

  return (
    <>
      <form className="post-composer flow" onSubmit={handleSubmit}>
        <input
          ref={mediaInputRef}
          type="file"
          className="post-composer__file-input"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(event) => {
            void handleFileChange(event.target.files?.[0] ?? null);
            event.target.value = '';
          }}
        />

        <div className="post-composer__stage">
          {previewUrl ? (
            <>
              {mediaKind === 'VIDEO' ? (
                <video src={previewUrl} controls playsInline className="post-composer__preview" />
              ) : (
                <img src={previewUrl} alt="" className="post-composer__preview" />
              )}
              <button
                type="button"
                className="post-composer__change-media btn-secondary"
                disabled={loading}
                onClick={() => openMediaPicker('any')}
              >
                {t('post.changeMedia')}
              </button>
            </>
          ) : (
            <div className="post-composer__picker">
              <p className="post-composer__picker-title">{t('post.media')}</p>
              <p className="hint">{t('post.hint', { seconds: MAX_CLIP_SECONDS })}</p>
              <div className="post-composer__picker-actions">
                <button type="button" className="btn-primary" onClick={() => openMediaPicker('image')}>
                  {t('post.pickPhoto')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => openMediaPicker('video')}>
                  {t('post.pickVideo')}
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="field">
          <span>{t('post.caption')}</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={3}
            maxLength={2200}
            placeholder={t('post.captionPlaceholder')}
          />
        </label>

        <button
          type="button"
          className="post-composer__extras-toggle btn-ghost"
          onClick={() => setShowExtras((open) => !open)}
        >
          {showExtras ? t('post.hideExtras') : t('post.showExtras')}
        </button>

        {showExtras ? (
          <div className="post-composer__extras flow">
            <label className="field">
              <span>{t('post.restaurant')}</span>
              <input
                value={restaurantTag}
                onChange={(event) => setRestaurantTag(event.target.value)}
                placeholder={t('post.restaurantPlaceholder')}
                maxLength={120}
              />
            </label>

            <PeopleTagPicker value={peopleTags} onChange={setPeopleTags} />

            <div className="location-picker-block">
              <div className="location-picker-block__header">
                <strong>{t('post.location')}</strong>
                <p className="hint">{t('post.placeHint')}</p>
                {placePreview ? <p className="hint">📍 {placePreview}</p> : null}
              </div>

              <SearchableSelect
                label={t('profile.country')}
                value={country}
                options={countryOptions.length ? countryOptions : countrySelectOptions(locale)}
                allowCustom
                placeholder={t('auth.searchHint')}
                onQueryChange={setCountryQuery}
                onChange={(next) => {
                  setCountry(next);
                  setCity('');
                  setRemoteCities([]);
                  setCityQuery('');
                }}
              />
              <SearchableSelect
                label={t('profile.city')}
                value={city}
                options={cityOptions}
                extraOptions={[...catalogCityExtras, ...remoteCities]}
                allowCustom
                placeholder={t('post.searchCity')}
                onQueryChange={scheduleCitySearch}
                onChange={(next) => {
                  void handleCityChange(next);
                }}
              />
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChange={(next) => {
                  setLatitude(next.latitude);
                  setLongitude(next.longitude);
                  setNeighborhood(next.neighborhood);
                  if (next.country) {
                    setCountry(next.country);
                  }
                  if (next.city) {
                    setCity(next.city);
                  }
                }}
              />
            </div>
          </div>
        ) : null}

        <SaveFeedback saved={saved} error={error} successKey="post.saved" />
        {loading && uploadLabel ? <UploadProgressBar percent={uploadProgress} label={uploadLabel} /> : null}

        <button type="submit" className="btn-primary post-composer__submit" disabled={loading || !file || Boolean(cropFile)}>
          {loading ? t('post.publishing') : t('post.share')}
        </button>
      </form>

      {cropFile ? (
        <ImageCropModal
          file={cropFile}
          aspect="post"
          onCancel={() => {
            setCropFile(null);
            setPreview(null, null);
          }}
          onConfirm={(cropped) => {
            setCropFile(null);
            setPreview(cropped, 'IMAGE');
          }}
        />
      ) : null}
    </>
  );
}
