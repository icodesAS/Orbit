import OrbitWorkspace from '@/components/OrbitWorkspace';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function HomePage() {
  return (
    <ErrorBoundary>
      <OrbitWorkspace />
    </ErrorBoundary>
  );
}
