interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-md border border-rose-900 bg-rose-950/60 px-4 py-3 text-sm text-rose-300">
      <span className="mr-2">⚠️</span>{message}
    </div>
  );
}