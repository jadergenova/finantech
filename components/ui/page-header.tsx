export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate" style={{ color: "var(--bright)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-end gap-2">{action}</div>}
    </div>
  );
}
