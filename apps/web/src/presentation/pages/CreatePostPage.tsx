import { Link, useNavigate } from 'react-router-dom';
import { PostComposer } from '@/presentation/components/PostComposer';
import { useI18n } from '@/presentation/context/I18nContext';

export function CreatePostPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="app-screen post-create-page">
      <header className="screen-header screen-header--actions">
        <Link to="/feed" className="btn-ghost btn-compact">
          {t('post.back')}
        </Link>
      </header>

      <PostComposer onPublished={(post) => navigate('/feed', { replace: true, state: { newPost: post } })} />
    </div>
  );
}
