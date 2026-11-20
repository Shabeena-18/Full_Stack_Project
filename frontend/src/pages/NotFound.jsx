import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState icon="compass" title="Page not found" actionTo="/" actionLabel="Back to Home">
      The page you are looking for doesn't exist.
    </EmptyState>
  );
}
