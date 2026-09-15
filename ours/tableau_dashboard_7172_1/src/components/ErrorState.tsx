interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="error-container"
    >
      <p className="error-message">Error: {message}</p>
      <p className="error-hint">Please refresh the page to try again.</p>
    </div>
  );
}
