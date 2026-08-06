import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useApi from "../api/useApi.js";
import { fetchItems } from "../store/itemsSlice.js";
import { logout } from "../store/authSlice.js";
import ItemCard from "../components/ItemCard.jsx";
import EditItemModal from "../components/EditItemModal.jsx";
import Spinner from "../components/Spinner.jsx";
import styles from "./ItemsPage.module.scss";

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
    return (
      <div className={styles.status}>
        <Spinner label="Loading items" />
        <p>Loading items…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={styles.status}>
        <p>
          Could not load items{error?.status ? ` (HTTP ${error.status})` : ""}.
        </p>
        {error?.body?.detail && <p>{String(error.body.detail)}</p>}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.status}>
        <p>No items yet — seed the database and refresh.</p>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Items</h1>
        {/* logout clears state+storage; ProtectedRoute's selector bounces us */}
        <button
          className={styles.logout}
          type="button"
          onClick={() => dispatch(logout())}
        >
          Log out
        </button>
      </header>
      <ul className={styles.grid}>
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
