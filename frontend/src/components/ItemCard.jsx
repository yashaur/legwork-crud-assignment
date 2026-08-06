export default function ItemCard({ item }) {
  const { key, value, ...meta } = item;

  return (
    <article className="itemCard">
      <h2 className="itemCardKey">{String(key)}</h2>
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
