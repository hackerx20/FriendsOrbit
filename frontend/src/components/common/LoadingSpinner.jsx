const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClass = `loading-${size}`;
  return (
    <span className={`loading loading-spinner ${sizeClass} ${className}`} />
  );
};

export default LoadingSpinner;