export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="empty-state" role="status">
      <div className="spinner-border text-accent" />
      <p className="text-muted-2 mt-3 mb-0">{label}</p>
    </div>
  );
}
