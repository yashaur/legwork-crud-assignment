import styles from "./ItemCard.module.scss";

export default function ItemCard({ item, onEdit }) {
  const { key, value, ...meta } = item;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.key}>{String(key)}</h2>
        <button
          className={styles.edit}
          type="button"
          onClick={() => onEdit(item)}
        >
          Edit
        </button>
      </div>

      <p className={styles.value}>{String(value)}</p>

      <dl className={styles.meta}>
        {Object.entries(meta).map(([field, fieldValue]) => (
          <div className={styles.metaRow} key={field}>
            <dt>{field}</dt>
            <dd>{String(fieldValue)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
