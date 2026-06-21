import { adminMetrics } from '@/lib/data';

export function AdminMetrics() {
  return (
    <div className="metrics">
      {adminMetrics.map(([label, value]) => (
        <div className="metric" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
