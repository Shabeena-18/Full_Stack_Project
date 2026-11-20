/** Shown when an API request fails. */
export default function ErrorState({ error, onRetry }) {
  return (
    <div className="empty-state">
      <i className="bi bi-exclamation-triangle" />
      <h4>Something went wrong</h4>
      <p className="text-muted-2">{error?.message || 'Please try again.'}</p>
      {onRetry && <button type="button" className="btn btn-accent mt-2" onClick={onRetry}>Try again</button>}
    </div>
  );
}
