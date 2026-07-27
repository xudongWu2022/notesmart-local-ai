function Input({
  label,
  type = 'text',
  error,
  ...props
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-content-secondary text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`shadow-none appearance-none border rounded-md w-full py-2.5 px-3 text-content-primary bg-surface-input leading-tight focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors ${
          error ? 'border-red-500' : 'border-border'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default Input;
