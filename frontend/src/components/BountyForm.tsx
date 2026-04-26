import { useState, type FormEvent } from "react";
import type { PostBountyInput } from "../lib/bountyContract";

interface BountyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: PostBountyInput) => Promise<{ ok: boolean }>;
}

const initialForm: PostBountyInput = {
  title: "",
  description: "",
  rewardXlm: 5,
  deadlineDays: 3,
};

export default function BountyForm({ open, onClose, onSubmit }: BountyFormProps) {
  const [form, setForm] = useState<PostBountyInput>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function updateField<K extends keyof PostBountyInput>(key: K, value: PostBountyInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Add both a title and a short description.");
      return;
    }

    if (form.rewardXlm <= 0) {
      setError("Reward must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        rewardXlm: form.rewardXlm,
        deadlineDays: form.deadlineDays,
      });

      if (result.ok) {
        setForm(initialForm);
        onClose();
      }
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not post bounty.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-shell" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Create bounty</p>
            <h2>Lock XLM and publish a task</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Ship a Tailwind landing page"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="What should be done, how should it be delivered, and what counts as complete?"
              rows={5}
            />
          </label>

          <div className="form-grid-two">
            <label>
              <span>Reward (XLM)</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.rewardXlm}
                onChange={(event) => updateField("rewardXlm", Number(event.target.value))}
              />
            </label>

            <label>
              <span>Deadline (days)</span>
              <select
                value={form.deadlineDays}
                onChange={(event) => updateField("deadlineDays", Number(event.target.value))}
              >
                {[1, 3, 5, 7, 14, 30].map((value) => (
                  <option key={value} value={value}>
                    {value} day{value > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn-solid" disabled={submitting}>
              {submitting ? "Posting..." : "Post Bounty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
