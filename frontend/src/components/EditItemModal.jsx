import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateItem } from "../store/itemsSlice.js";
import styles from "./EditItemModal.module.scss";

export default function EditItemModal({ item, api, onClose }) {
  const [draftKey, setDraftKey] = useState(item.key);
  const [draftValue, setDraftValue] = useState(item.value);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await dispatch(
        updateItem({
          api,
          id: item.id,
          changes: { key: draftKey, value: draftValue },
        }),
      ).unwrap();
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  const fieldErrors =
    error?.body && typeof error.body === "object"
      ? Object.entries(error.body)
      : [];

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Edit item</h2>

        <label className={styles.field} htmlFor="editKey">
          Key
          <input
            id="editKey"
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
          />
        </label>

        <label className={styles.field} htmlFor="editValue">
          Value
          <textarea
            id="editValue"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
          />
        </label>

        {error && (
          <div className={styles.error}>
            {fieldErrors.length > 0 ? (
              fieldErrors.map(([field, messages]) => (
                <p key={field}>
                  {field}: {String(messages)}
                </p>
              ))
            ) : (
              <p>
                Could not save{error?.status ? ` (HTTP ${error.status})` : ""}.
              </p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.save} type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            className={styles.cancel}
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
