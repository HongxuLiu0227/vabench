interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading dashboard...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="loading-container"
    >
      <div className="loading-spinner" aria-hidden="true"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
