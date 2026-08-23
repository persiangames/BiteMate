import { HealthStatus } from '@/presentation/components/HealthStatus';

export function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">BiteMate</p>
        <h1>Global food social networking</h1>
        <p className="subtitle">
          Share food experiences, meet people for food events, and connect with
          restaurants and home chefs.
        </p>
      </header>

      <section className="panel">
        <HealthStatus />
      </section>
    </main>
  );
}
