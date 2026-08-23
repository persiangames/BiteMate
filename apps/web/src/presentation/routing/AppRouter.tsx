import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/presentation/context/AuthContext';
import { I18nProvider } from '@/presentation/context/I18nContext';
import { ThemeProvider } from '@/presentation/context/ThemeContext';
import { ClickSoundListener } from '@/presentation/components/ClickSoundListener';
import { LanguageSwitcher } from '@/presentation/components/LanguageSwitcher';

import { AppShell } from '@/presentation/components/layout/AppShell';
import { AuthenticatedLayout } from '@/presentation/components/layout/AuthenticatedLayout';
import { PublicShell } from '@/presentation/components/layout/PublicShell';

import { DiscoverPage } from '@/presentation/pages/DiscoverPage';

import { CreatePostPage } from '@/presentation/pages/CreatePostPage';

import { FeedPage } from '@/presentation/pages/FeedPage';

import { BookingsPage } from '@/presentation/pages/BookingsPage';

import { CreateRestaurantPage } from '@/presentation/pages/CreateRestaurantPage';

import { HomeChefPage } from '@/presentation/pages/HomeChefPage';

import { HomeChefsBrowsePage } from '@/presentation/pages/HomeChefsBrowsePage';

import { RestaurantDetailPage } from '@/presentation/pages/RestaurantDetailPage';

import { RestaurantsPage } from '@/presentation/pages/RestaurantsPage';

import { ChatsPage } from '@/presentation/pages/ChatsPage';

import { ChatThreadPage } from '@/presentation/pages/ChatThreadPage';

import { MeetupsPage } from '@/presentation/pages/MeetupsPage';

import { MeetupRoomPage } from '@/presentation/pages/MeetupRoomPage';

import { LanguagePage } from '@/presentation/pages/LanguagePage';

import { LoginPage } from '@/presentation/pages/LoginPage';
import { ForgotPasswordPage } from '@/presentation/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/presentation/pages/ResetPasswordPage';

import { SettingsPage } from '@/presentation/pages/SettingsPage';
import { ProfileEditPage } from '@/presentation/pages/ProfileEditPage';

import { ProfilePage } from '@/presentation/pages/ProfilePage';
import { PublicProfilePage } from '@/presentation/pages/PublicProfilePage';
import { FollowListPage } from '@/presentation/pages/FollowListPage';
import { MeetupHistoryPage } from '@/presentation/pages/MeetupHistoryPage';

import { PremiumPage } from '@/presentation/pages/PremiumPage';

import { RankingsPage } from '@/presentation/pages/RankingsPage';

import { RegisterPage } from '@/presentation/pages/RegisterPage';

import { SplashPage } from '@/presentation/pages/SplashPage';

import { VerifyOtpPage } from '@/presentation/pages/VerifyOtpPage';

import { WalletPage } from '@/presentation/pages/WalletPage';
import { NotificationsPage } from '@/presentation/pages/NotificationsPage';

import {

  AuthGate,

  GuestGate,

  OtpGate,

  VerifiedGate,

} from '@/presentation/routing/RouteGuards';



export function AppRouter() {

  return (

    <AuthProvider>

      <I18nProvider>
        <ThemeProvider>
        <ClickSoundListener />
        <BrowserRouter>
        <LanguageSwitcher />

          <Routes>

            <Route path="/" element={<SplashPage />} />

            <Route element={<PublicShell />}>

              <Route path="/language" element={<LanguagePage />} />

              <Route element={<GuestGate />}>

                <Route path="/login" element={<LoginPage />} />

                <Route path="/register" element={<RegisterPage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                <Route path="/reset-password" element={<ResetPasswordPage />} />

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
        </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>

    </AuthProvider>

  );

}

