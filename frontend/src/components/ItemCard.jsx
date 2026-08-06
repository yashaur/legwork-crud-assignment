export default function ItemCard({ item, onEdit }) {
  const { key, value, ...meta } = item;

  return (
    <article className="itemCard">
      <h2 className="itemCardKey">{String(key)}</h2>
      <button
        className="itemCardEdit"
        type="button"
        onClick={() => onEdit(item)}
      >
        Edit
      </button>
      <p className="itemCardValue">{String(value)}</p>

      <dl className="itemCardMeta">
        {Object.entries(meta).map(([field, fieldValue]) => (
          <div className="itemCardMetaRow" key={field}>
            <dt>{field}</dt>
            <dd>{String(fieldValue)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
