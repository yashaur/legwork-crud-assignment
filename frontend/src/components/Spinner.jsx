import styles from "./Spinner.module.scss";

export default function Spinner({ label = "Loading" }) {
  return <span className={styles.spinner} role="status" aria-label={label} />;
}
