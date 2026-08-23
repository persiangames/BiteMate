import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchMeetupRoom } from '@/data/repositories/meetupRepository';
import { useAuth } from '@/presentation/context/AuthContext';

export function MeetupRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !roomId) return;

    async function load() {
      try {
        const room = await fetchMeetupRoom(accessToken!, roomId!);
        if (room.chatId) {
          navigate(`/chats/${room.chatId}`, { replace: true });
          return;
        }
        setError('Chat room is still being prepared. Try again in a moment.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to open food room');
      }
    }

    void load();
  }, [accessToken, roomId, navigate]);

  return (
    <main className="page">
      <section className="panel flow">
        <p className="hint">Opening food room chat…</p>
        {error && (
          <>
            <p className="error">{error}</p>
            <Link to="/meetups">Back to meetups</Link>
          </>
        )}
      </section>
    </main>
  );
}
