import { useState } from 'react';
import type { FormEvent } from 'react';

interface AddMonitorFormProps {
  onAdd: (payload: { label: string; url: string }) => Promise<void>;
}

export function AddMonitorForm({ onAdd }: AddMonitorFormProps) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim() || !url.trim()) {
      setFormError('Both label and URL are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onAdd({ label: label.trim(), url: url.trim() });
      setLabel('');
      setUrl('');
    } catch (err) {
      setFormError('Failed to add monitor. Please check the URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="label" className="mb-1 block text-xs font-medium text-slate-400">Label</label>
        <input id="label" type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My API"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
      </div>
      <div className="flex-[2]">
        <label htmlFor="url" className="mb-1 block text-xs font-medium text-slate-400">URL</label>
        <input id="url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
      </div>
      <button type="submit" disabled={isSubmitting}
        className="whitespace-nowrap rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting ? 'Adding…' : 'Add Monitor'}
      </button>
      {formError && <p className="text-xs text-rose-400 sm:ml-2">{formError}</p>}
    </form>
  );
}