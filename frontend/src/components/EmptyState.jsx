import { Link } from 'react-router-dom';

/** Icon + heading + optional button, used for empty lists and errors. */
export default function EmptyState({ icon, title, children, actionTo, actionLabel }) {
  return (
    <div className="empty-state">
      <i className={`bi bi-${icon}`} />
      <h4>{title}</h4>
      {children && <p className="text-muted-2">{children}</p>}
      {actionTo && <Link to={actionTo} className="btn btn-accent mt-2">{actionLabel}</Link>}
    </div>
  );
}
