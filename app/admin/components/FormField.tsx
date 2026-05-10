interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export default function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white ${props.className || ""}`}
    >
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent ${props.className || ""}`}
    />
  );
}
