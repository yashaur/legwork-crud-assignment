import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useApi from "../api/useApi.js";
import { fetchItems } from "../store/itemsSlice.js";
import ItemCard from "../components/ItemCard.jsx";
import EditItemModal from "../components/EditItemModal.jsx";

export default function ItemsPage() {
  const api = useApi();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.items);

  // Which item is being edited; null = modal closed (guide 16 §3.1).
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchItems(api));
    }
  }, [status, dispatch, api]);

  if (status === "loading" || status === "idle") {
    return <p className="itemsStatus">Loading items…</p>;
  }

  if (status === "failed") {
    return (
      <div className="itemsStatus">
        <p>
          Could not load items{error?.status ? ` (HTTP ${error.status})` : ""}.
        </p>
        {error?.body?.detail && <p>{String(error.body.detail)}</p>}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="itemsStatus">
        No items yet — seed the database and refresh.
      </p>
    );
  }

  return (
    <main className="itemsPage">
      <h1>Items</h1>
      <ul className="itemsList">
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} onEdit={setEditing} />
          </li>
        ))}
      </ul>

      {editing && (
        <EditItemModal
          item={editing}
          api={api}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
