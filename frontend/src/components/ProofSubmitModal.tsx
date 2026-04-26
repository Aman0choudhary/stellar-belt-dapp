import { useEffect, useState, type FormEvent } from "react";
import type { BountyItem } from "../lib/bountyContract";

interface ProofSubmitModalProps {
  bounty: BountyItem | null;
  onClose: () => void;
  onSubmit: (bountyId: number, proofLink: string) => Promise<{ ok: boolean }>;
}

export default function ProofSubmitModal({
  bounty,
  onClose,
  onSubmit,
}: ProofSubmitModalProps) {
  const [proofLink, setProofLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProofLink("");
    setError(null);
    setSubmitting(false);
  }, [bounty]);

  if (!bounty) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const value = proofLink.trim();
    if (!value) {
      setError("Add a proof link before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await onSubmit(bounty.id, value);
      if (result.ok) {
        onClose();
      }
    } catch (unknownError: unknown) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not submit proof.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-shell" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Submit proof</p>
            <h2>{bounty.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Proof URL</span>
            <input
              type="url"
              value={proofLink}
              onChange={(event) => setProofLink(event.target.value)}
              placeholder="https://github.com/... or https://loom.com/..."
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn-solid" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Proof"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
