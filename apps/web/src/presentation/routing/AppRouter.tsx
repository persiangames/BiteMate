import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/presentation/context/AuthContext';
import { I18nProvider } from '@/presentation/context/I18nContext';
import { SoundProvider } from '@/presentation/context/SoundContext';
import { ThemeProvider } from '@/presentation/context/ThemeContext';
import { ClickSoundListener } from '@/presentation/components/ClickSoundListener';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';

import { AppShell } from '@/presentation/components/layout/AppShell';
import { AuthenticatedLayout } from '@/presentation/components/layout/AuthenticatedLayout';
import { PublicShell } from '@/presentation/components/layout/PublicShell';
import { AuthEntryLayout } from '@/presentation/components/layout/AuthEntryLayout';
import { AppPageBackdrop } from '@/presentation/components/layout/AppPageBackdrop';
import { MarketingShell } from '@/presentation/components/layout/MarketingShell';

import {
  AuthGate,
  GuestGate,
  OtpGate,
  VerifiedGate,
} from '@/presentation/routing/RouteGuards';

const DiscoverPage = lazy(() =>
  import('@/presentation/pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })),
);
const CreatePostPage = lazy(() =>
  import('@/presentation/pages/CreatePostPage').then((m) => ({ default: m.CreatePostPage })),
);
const FeedPage = lazy(() => import('@/presentation/pages/FeedPage').then((m) => ({ default: m.FeedPage })));
const BookingsPage = lazy(() =>
  import('@/presentation/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })),
);
const CreateRestaurantPage = lazy(() =>
  import('@/presentation/pages/CreateRestaurantPage').then((m) => ({ default: m.CreateRestaurantPage })),
);
const HomeChefPage = lazy(() =>
  import('@/presentation/pages/HomeChefPage').then((m) => ({ default: m.HomeChefPage })),
);
const HomeChefsBrowsePage = lazy(() =>
  import('@/presentation/pages/HomeChefsBrowsePage').then((m) => ({ default: m.HomeChefsBrowsePage })),
);
const RestaurantDetailPage = lazy(() =>
  import('@/presentation/pages/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage })),
);
const RestaurantsPage = lazy(() =>
  import('@/presentation/pages/RestaurantsPage').then((m) => ({ default: m.RestaurantsPage })),
);
const ChatsPage = lazy(() => import('@/presentation/pages/ChatsPage').then((m) => ({ default: m.ChatsPage })));
const ChatThreadPage = lazy(() =>
  import('@/presentation/pages/ChatThreadPage').then((m) => ({ default: m.ChatThreadPage })),
);
const MeetupsPage = lazy(() =>
  import('@/presentation/pages/MeetupsPage').then((m) => ({ default: m.MeetupsPage })),
);
const MeetupRoomPage = lazy(() =>
  import('@/presentation/pages/MeetupRoomPage').then((m) => ({ default: m.MeetupRoomPage })),
);
const LanguagePage = lazy(() =>
  import('@/presentation/pages/LanguagePage').then((m) => ({ default: m.LanguagePage })),
);
const LoginPage = lazy(() => import('@/presentation/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/presentation/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/presentation/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const SearchPage = lazy(() =>
  import('@/presentation/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const SettingsPage = lazy(() =>
  import('@/presentation/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const ProfileEditPage = lazy(() =>
  import('@/presentation/pages/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage })),
);
const ProfilePage = lazy(() =>
  import('@/presentation/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const PublicProfilePage = lazy(() =>
  import('@/presentation/pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })),
);
const FollowListPage = lazy(() =>
  import('@/presentation/pages/FollowListPage').then((m) => ({ default: m.FollowListPage })),
);
const MeetupHistoryPage = lazy(() =>
  import('@/presentation/pages/MeetupHistoryPage').then((m) => ({ default: m.MeetupHistoryPage })),
);
const PremiumPage = lazy(() =>
  import('@/presentation/pages/PremiumPage').then((m) => ({ default: m.PremiumPage })),
);
const RegisterPage = lazy(() =>
  import('@/presentation/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const AboutPage = lazy(() => import('@/presentation/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('@/presentation/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const LandingPage = lazy(() =>
  import('@/presentation/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const VerifyOtpPage = lazy(() =>
  import('@/presentation/pages/VerifyOtpPage').then((m) => ({ default: m.VerifyOtpPage })),
);
const WalletPage = lazy(() => import('@/presentation/pages/WalletPage').then((m) => ({ default: m.WalletPage })));
const NotificationsPage = lazy(() =>
  import('@/presentation/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const RankingsPage = lazy(() =>
  import('@/presentation/pages/RankingsPage').then((m) => ({ default: m.RankingsPage })),
);

function RouteFallback() {
  return (
    <main className="page">
      <section className="panel">
        <p className="hint">…</p>
      </section>
    </main>
  );
}

export function AppRouter() {
  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <SoundProvider>
            <ClickSoundListener />
            <BrowserRouter>
              <LanguageSwitcher placement="floating" />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route
                    element={
                      <AppPageBackdrop>
                        <MarketingShell />
                      </AppPageBackdrop>
                    }
                  >
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                  </Route>

                  <Route element={<PublicShell />}>
                    <Route path="/language" element={<LanguagePage />} />

                    <Route element={<AuthEntryLayout />}>
                      <Route element={<GuestGate />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                      </Route>
                    </Route>

                    <Route element={<AuthGate />}>
                      <Route element={<OtpGate />}>
                        <Route path="/verify-otp" element={<VerifyOtpPage />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route element={<AuthGate />}>
                    <Route element={<VerifiedGate />}>
                      <Route element={<AuthenticatedLayout />}>
                        <Route element={<AppShell />}>
                          <Route path="/feed" element={<FeedPage />} />
                          <Route path="/people" element={<SearchPage />} />
                          <Route path="/search" element={<Navigate to="/people" replace />} />
                          <Route path="/discover" element={<DiscoverPage />} />
                          <Route path="/meetups" element={<MeetupsPage />} />
                          <Route path="/chats" element={<ChatsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/u/:username" element={<PublicProfilePage />} />
                          <Route path="/u/:username/events/:kind" element={<MeetupHistoryPage />} />
                          <Route path="/u/:username/followers" element={<FollowListPage />} />
                          <Route path="/u/:username/following" element={<FollowListPage />} />
                          <Route path="/profile/events/:kind" element={<MeetupHistoryPage />} />
                          <Route path="/profile/followers" element={<FollowListPage />} />
                          <Route path="/profile/following" element={<FollowListPage />} />
                          <Route path="/feed/create" element={<CreatePostPage />} />
                          <Route path="/profile/edit" element={<ProfileEditPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/marketplace/restaurants" element={<RestaurantsPage />} />
                          <Route path="/marketplace/restaurants/create" element={<CreateRestaurantPage />} />
                          <Route path="/marketplace/restaurants/:id" element={<RestaurantDetailPage />} />
                          <Route path="/marketplace/home-chefs" element={<HomeChefsBrowsePage />} />
                          <Route path="/marketplace/home-chefs/:id" element={<HomeChefPage />} />
                          <Route path="/marketplace/home-chef/dashboard" element={<HomeChefPage />} />
                          <Route path="/bookings" element={<BookingsPage />} />
                          <Route path="/meetups/room/:roomId" element={<MeetupRoomPage />} />
                          <Route path="/chats/:chatId" element={<ChatThreadPage />} />
                          <Route path="/wallet" element={<WalletPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/rankings" element={<RankingsPage />} />
                          <Route path="/premium" element={<PremiumPage />} />
                          <Route path="/home" element={<Navigate to="/feed" replace />} />
                        </Route>
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SoundProvider>
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
