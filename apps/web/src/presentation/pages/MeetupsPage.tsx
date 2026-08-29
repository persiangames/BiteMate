import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type {
  CreateFoodIntentResponseDto,
  FoodIntentDto,
  IntentMatchDto,
  MeetupInviteDto,
} from '@bitemate/shared';
import {
  connectRealtime,
  disconnectRealtime,
  onMeetupInvite,
} from '@/data/api/socketClient';
import {
  cancelFoodIntent,
  fetchIntentDailyLimit,
  fetchIntentMatches,
  fetchMyIntents,
} from '@/data/repositories/intentRepository';
import {
  acceptMeetupInvite,
  fetchInviteLimit,
  fetchMyInvites,
  rejectMeetupInvite,
  sendMeetupInvite,
} from '@/data/repositories/meetupRepository';
import { localizeFoodType } from '@/data/localize';
import { MeetupComposer } from '@/presentation/components/MeetupComposer';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MeetupsPage() {
  const { accessToken } = useAuth();
  const { t, locale } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteeId = searchParams.get('invitee');

  const [myIntents, setMyIntents] = useState<FoodIntentDto[]>([]);
  const [activeIntent, setActiveIntent] = useState<FoodIntentDto | null>(null);
  const [matches, setMatches] = useState<IntentMatchDto[]>([]);
  const [invites, setInvites] = useState<MeetupInviteDto[]>([]);
  const [intentLimit, setIntentLimit] = useState('');
  const [inviteLimit, setInviteLimit] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const [intents, incoming, invitesQuota, intentQuota] = await Promise.all([
        fetchMyIntents(accessToken),
        fetchMyInvites(accessToken),
        fetchInviteLimit(accessToken),
        fetchIntentDailyLimit(accessToken),
      ]);
      setMyIntents(intents.items);
      setInvites(incoming.items);
      setInviteLimit(
        t('meetups.inviteLimit', {
          used: invitesQuota.usedToday,
          limit: invitesQuota.dailyLimit,
        }),
      );
      setIntentLimit(
        t('meetups.intentLimit', {
          active: intentQuota.activeCount,
          maxActive: intentQuota.maxActive,
          used: intentQuota.usedToday,
          daily: intentQuota.dailyLimit,
        }),
      );
    } catch {
      setError(t('meetups.loadFailed'));
    }
  }, [accessToken, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const createdMeetupId = (location.state as { createdMeetupId?: string } | null)?.createdMeetupId;
    if (!createdMeetupId || !myIntents.length) {
      return;
    }

    const intent = myIntents.find((item) => item.meetupId === createdMeetupId);
    if (!intent) {
      return;
    }

    setActiveIntent(intent);
    setMessage(t('event.created'));
    void loadMatches(intent.id);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, myIntents, navigate, t]);

  useEffect(() => {
    if (!accessToken) return;

    connectRealtime(accessToken);
    const unsubscribe = onMeetupInvite((invite) => {
      setInvites((current) => [invite, ...current.filter((item) => item.id !== invite.id)]);
      setMessage(t('meetups.inviteReceived', { food: localizeFoodType(invite.meetup.foodType, locale) }));
    });

    return () => {
      unsubscribe();
      disconnectRealtime();
    };
  }, [accessToken, locale, t]);

  async function loadMatches(intentId: string) {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchIntentMatches(accessToken, intentId);
      setMatches(response.items);
    } catch {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreated(response: CreateFoodIntentResponseDto) {
    if (!accessToken) return;

    const intent = response.intent;
    setActiveIntent(intent);
    setMyIntents((current) => [intent, ...current.filter((item) => item.id !== intent.id)]);
    setMessage(t('save.success'));

    try {
      if (inviteeId && intent.meetupId) {
        await sendMeetupInvite(accessToken, { meetupId: intent.meetupId, inviteeId });
        setMessage(t('meetups.inviteSent'));
      }
      await loadMatches(intent.id);
      await loadData();
    } catch {
      setError(t('error.generic'));
    }
  }

  async function handleCancel(intentId: string) {
    if (!accessToken) return;

    try {
      await cancelFoodIntent(accessToken, { intentId });
      setMyIntents((current) => current.filter((item) => item.id !== intentId));
      if (activeIntent?.id === intentId) {
        setActiveIntent(null);
        setMatches([]);
      }
      setMessage(t('meetups.cancelled'));
      await loadData();
    } catch {
      setError(t('error.generic'));
    }
  }

  async function handleInvite(meetupId: string | null, targetInviteeId: string) {
    if (!accessToken || !meetupId) return;

    setMessage(null);
    setError(null);

    try {
      await sendMeetupInvite(accessToken, { meetupId, inviteeId: targetInviteeId });
      setMessage(t('meetups.inviteSent'));
      const limit = await fetchInviteLimit(accessToken);
      setInviteLimit(t('meetups.inviteLimit', { used: limit.usedToday, limit: limit.dailyLimit }));
    } catch {
      setError(t('error.generic'));
    }
  }

  async function handleAccept(inviteId: string) {
    if (!accessToken) return;

    try {
      const invite = await acceptMeetupInvite(accessToken, { inviteId });
      setInvites((current) => current.filter((item) => item.id !== inviteId));
      setMessage(t('meetups.accepted'));
      if (invite.meetup.roomId) {
        window.location.href = `/meetups/room/${invite.meetup.roomId}`;
      }
    } catch {
      setError(t('error.generic'));
    }
  }

  async function handleReject(inviteId: string) {
    if (!accessToken) return;

    try {
      await rejectMeetupInvite(accessToken, { inviteId });
      setInvites((current) => current.filter((item) => item.id !== inviteId));
    } catch {
      setError(t('error.generic'));
    }
  }

  return (
    <div className="app-screen meetups-page">
      <section className="glass-card flow">
        <p className="hint">{t('meetups.matchingHint')}</p>
        <p className="hint">{intentLimit}</p>
        <p className="hint">{inviteLimit}</p>
        {inviteeId ? <p className="save-success">{t('meetups.inviteeReady')}</p> : null}
      </section>

      <MeetupComposer
        embedded
        submitLabelKey="meetups.find"
        successMessageKey="save.success"
        onCreated={(response) => void handleCreated(response)}
      />

      {myIntents.length > 0 && (
        <div className="flow">
          <h2>{t('meetups.mine')}</h2>
          {myIntents.map((intent) => (
            <article key={intent.id} className="glass-card meetup-card">
              <h3>{localizeFoodType(intent.foodType, locale)}</h3>
              <p>
                {new Date(intent.timeStart).toLocaleString()} · {intent.desiredPeople} ·{' '}
                {intent.radiusKm} km
              </p>
              <p className="hint">{t('meetups.status', { status: intent.status })}</p>
              <div className="meetup-card__row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveIntent(intent);
                    void loadMatches(intent.id);
                  }}
                >
                  {t('meetups.findMatches')}
                </button>
                {intent.status === 'ACTIVE' && (
                  <button type="button" className="btn-ghost" onClick={() => void handleCancel(intent.id)}>
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {activeIntent && matches.length > 0 && (
        <div className="flow">
          <h2>{t('meetups.matches', { food: localizeFoodType(activeIntent.foodType, locale) })}</h2>
          {matches.map((match) => (
            <article key={`${match.matchType}-${match.user.id}`} className="glass-card meetup-card">
              <h3>{match.user.fullName ?? match.user.username ?? t('post.user')}</h3>
              <p>
                {t('meetups.matchScore', {
                  score: match.score,
                  distance: match.distanceKm,
                  rating: match.user.meetupRating.toFixed(1),
                })}
                {match.user.isPremium ? ` · ${t('premium.title')}` : ''}
              </p>
              <p className="hint">
                {match.matchType === 'INTENT' ? t('meetups.matchIntent') : t('meetups.matchUser')} ·{' '}
                {t('meetups.reliability', { score: match.user.reliabilityScore })}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleInvite(activeIntent.meetupId, match.user.id)}
              >
                {t('nearby.invite')}
              </button>
            </article>
          ))}
        </div>
      )}

      {invites.length > 0 && (
        <div className="flow">
          <h2>{t('meetups.incoming')}</h2>
          {invites.map((invite) => (
            <article key={invite.id} className="glass-card meetup-card">
              <h3>{localizeFoodType(invite.meetup.foodType, locale)}</h3>
              <p>
                {t('meetups.inviteFrom', {
                  name: invite.inviter.fullName ?? invite.inviter.username ?? t('post.user'),
                  when: new Date(invite.meetup.scheduledAt).toLocaleString(),
                })}
              </p>
              {invite.meetup.isFull ? (
                <span className="full-badge">{t('meetups.full')}</span>
              ) : (
                <span className="seats-badge">{t('meetups.seatsLeft', { count: invite.meetup.seatsLeft })}</span>
              )}
              <div className="meetup-card__row">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={invite.meetup.isFull}
                  onClick={() => void handleAccept(invite.id)}
                >
                  {invite.meetup.isFull ? t('meetups.full') : t('meetups.join')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => void handleReject(invite.id)}>
                  {t('meetups.reject')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {loading ? <p className="hint">{t('common.loading')}</p> : null}
      {message ? (
        <p className="save-success" role="status">
          {message}
        </p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}

      <p className="hint meetups-page__feed-link">
        <Link to="/feed/create-event">{t('meetups.createFromFeed')}</Link>
      </p>
    </div>
  );
}
