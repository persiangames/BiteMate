import type { ReactNode } from 'react';
import { DoodleBackground } from '@/presentation/components/decor/DoodleBackground';

type AppPageBackdropProps = {
  children: ReactNode;
  className?: string;
};

export function AppPageBackdrop({ children, className = '' }: AppPageBackdropProps) {
  return (
    <div className={`app-page-backdrop ${className}`.trim()}>
      <DoodleBackground />
      <div className="app-page-backdrop__content">{children}</div>
    </div>
  );
}
