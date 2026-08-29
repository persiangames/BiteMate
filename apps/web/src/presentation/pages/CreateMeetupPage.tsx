import { Link, useNavigate } from 'react-router-dom';
import { MeetupComposer } from '@/presentation/components/MeetupComposer';
import { useI18n } from '@/presentation/context/I18nContext';

export function CreateMeetupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="app-screen post-create-page">
      <header className="screen-header screen-header--actions">
        <Link to="/feed" className="btn-ghost btn-compact">
          {t('post.back')}
        </Link>
      </header>

      <MeetupComposer
        onCreated={(meetupId) => {
          if (meetupId) {
            navigate('/meetups', { replace: true, state: { createdMeetupId: meetupId } });
            return;
          }
          navigate('/meetups', { replace: true });
        }}
      />
    </div>
  );
}
