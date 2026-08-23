import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { geocodeCity, searchPlaces, type PlaceHit } from '@/data/geo/geocode';
import { citySelectOptions, countrySelectOptions, formatPlace } from '@/data/localize';
import { uploadMedia } from '@/data/api/uploadClient';
import { isDemoAccessToken } from '@/data/demo/demoSession';
import { createPost } from '@/data/repositories/feedRepository';
import { ImageCropModal } from '@/presentation/components/ImageCropModal';
import { LocationPickerMap } from '@/presentation/components/LocationPickerMap';
import { PeopleTagPicker, type SelectedTag } from '@/presentation/components/PeopleTagPicker';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDeviceLocation } from '@/presentation/context/DeviceLocationContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { MAX_CLIP_SECONDS, preparePostMedia } from '@/utils/prepareMedia';

function buildLocationLabel(
  locale: string,
  country: string,
  city: string,
  neighborhood: string | null,
): string | undefined {
  const place = formatPlace(city || null, country || null, locale);
  const parts = [neighborhood, place].filter(Boolean);
  const label = parts.join(' · ').trim();
  if (!label) {
    return undefined;
  }
  return label.slice(0, 120);
}

export function CreatePostPage() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const gps = useDeviceLocation();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [peopleTags, setPeopleTags] = useState<SelectedTag[]>([]);
  const [restaurantTag, setRestaurantTag] = useState('');
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(user?.liveLatitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(user?.liveLongitude ?? null);
  const [remoteCities, setRemoteCities] = useState<Array<{ value: string; label: string }>>([]);
  const [file, setFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const remoteHits = useRef(new Map<string, PlaceHit>());
  const citySearchTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (citySearchTimer.current) {
        window.clearTimeout(citySearchTimer.current);
      }
    };
  }, []);

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(country, locale), [country, locale]);

  useEffect(() => {
    if (latitude != null || longitude != null || !gps.fix) {
      return;
    }
    setLatitude(gps.fix.latitude);
    setLongitude(gps.fix.longitude);
  }, [gps.fix, latitude, longitude]);

  function setPreview(next: File | null, kind: 'IMAGE' | 'VIDEO' | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(next);
    setMediaKind(kind);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
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
      } catch {
        setPreview(null, null);
        setError(t('post.videoFailed'));
      }
      return;
    }
    if (selected.type.startsWith('image/')) {
      setCropFile(selected);
      return;
    }
    setError(t('post.chooseMedia'));
  }

  function applyPlace(hit: PlaceHit) {
    remoteHits.current.set(hit.city, hit);
    setCountry(hit.country);
    setCity(hit.city);
    setLatitude(hit.latitude);
    setLongitude(hit.longitude);
  }

  function scheduleCitySearch(query: string) {
    if (citySearchTimer.current) {
      window.clearTimeout(citySearchTimer.current);
    }
    citySearchTimer.current = window.setTimeout(() => {
      const needle = query.trim();
      if (needle.length < 2) {
        setRemoteCities([]);
        return;
      }
      void searchPlaces(needle, country || undefined)
        .then((hits) => {
          remoteHits.current.clear();
          for (const hit of hits) {
            remoteHits.current.set(hit.city, hit);
          }
          setRemoteCities(
            hits.map((hit) => ({
              value: hit.city,
              label: country ? hit.city : `${hit.city} · ${hit.country}`,
            })),
          );
        })
        .catch(() => setRemoteCities([]));
    }, 380);
  }

  async function handleCityChange(nextCity: string) {
    const hit = remoteHits.current.get(nextCity);
    if (hit) {
      applyPlace(hit);
      return;
    }
    setCity(nextCity);
    if (!country) {
      return;
    }
    const coords = await geocodeCity(country, nextCity).catch(() => null);
    if (!coords) {
      return;
    }
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
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

    try {
      const prepared = await preparePostMedia(file);
      let thumbnailUrl: string | undefined;
      if (prepared.poster) {
        const poster = await uploadMedia(accessToken, prepared.poster);
        thumbnailUrl = poster.mediaUrl;
      }
      const uploaded = await uploadMedia(accessToken, prepared.file);
      await createPost(accessToken, {
        caption: caption || undefined,
        mediaType: uploaded.mediaType,
        mediaUrl: uploaded.mediaUrl,
        thumbnailUrl: thumbnailUrl ?? uploaded.thumbnailUrl ?? undefined,
        restaurantTag: restaurantTag.trim() || undefined,
        tags: peopleTags.map((tag) => ({ userId: tag.userId, role: tag.role })),
        locationLabel: buildLocationLabel(locale, country, city, neighborhood),
        locationLat: latitude ?? undefined,
        locationLng: longitude ?? undefined,
      });

      setSaved(true);
      window.setTimeout(() => navigate('/feed'), 900);
    } catch (err) {
      setError(localizeError(t, err, 'post.failed'));
    } finally {
      setLoading(false);
    }
  }

  const placePreview = buildLocationLabel(locale, country, city, neighborhood);

  return (
    <main className="page">
      <section className="panel flow">
        <h1>{t('post.new')}</h1>
        <p className="hint">{t('post.hint', { seconds: MAX_CLIP_SECONDS })}</p>

        <form className="flow" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('post.media')}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
              required={!file}
            />
          </label>

          {previewUrl &&
            (mediaKind === 'VIDEO' ? (
              <video src={previewUrl} controls className="post-media" />
            ) : (
              <img src={previewUrl} alt="" className="post-media" />
            ))}

          <label className="field">
            <span>{t('post.caption')}</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={3}
              placeholder={t('post.captionPlaceholder')}
            />
          </label>

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
              options={countryOptions}
              allowCustom
              placeholder={t('auth.searchHint')}
              onChange={(next) => {
                setCountry(next);
                setCity('');
                setRemoteCities([]);
              }}
            />
            <SearchableSelect
              label={t('profile.city')}
              value={city}
              options={cityOptions}
              extraOptions={remoteCities}
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

          <SaveFeedback saved={saved} error={error} successKey="post.saved" />

          <button type="submit" className="btn-primary" disabled={loading || !file}>
            {loading ? t('post.publishing') : t('post.share')}
          </button>
        </form>

        {cropFile ? (
          <ImageCropModal
            file={cropFile}
            aspect="post"
            onCancel={() => setCropFile(null)}
            onConfirm={(cropped) => {
              setCropFile(null);
              setPreview(cropped, 'IMAGE');
            }}
          />
        ) : null}

        <p>
          <Link to="/feed">{t('post.back')}</Link>
        </p>
      </section>
    </main>
  );
}
