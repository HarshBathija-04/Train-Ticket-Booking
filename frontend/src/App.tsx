import { MapPinOff } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { EmptyState, Skeleton } from './components/ui';
import Home from './pages/Home';
import Search from './pages/Search';

const Book = lazy(() => import('./pages/Book'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AuthPage = lazy(() => import('./pages/Auth'));
const Admin = lazy(() => import('./pages/Admin'));

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        icon={MapPinOff}
        title="This platform doesn't exist"
        action={
          <Link to="/" className="btn-primary">
            Back to search
          </Link>
        }
      >
        The page you were looking for has left the station.
      </EmptyState>
    </div>
  );
}

const fallback = (
  <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true">
    <Skeleton className="h-64" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="register" element={<AuthPage mode="register" />} />
          <Route
            path="book/:scheduleId/:classCode"
            element={
              <RequireAuth>
                <Book />
              </RequireAuth>
            }
          />
          <Route
            path="bookings"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="bookings/:pnr"
            element={
              <RequireAuth>
                <BookingDetail />
              </RequireAuth>
            }
          />
          <Route
            path="admin"
            element={
              <RequireAuth admin>
                <Admin />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
