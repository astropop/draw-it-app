import styles from "./page.module.css";
import HomePage from "./ui/components/HomePage";

export default async function Home() {
  return (
    <div className={styles.page}>
      <HomePage />
    </div>
  );
}
