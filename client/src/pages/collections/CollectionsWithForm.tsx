import { AddCollectionForm } from "./AddCollectionForm";
import { CollectionsPage } from "./CollectionsPage";

export default function CollectionsWithForm() {
  const [refresh, setRefresh] = useState(false);
  return (
    <div>
      <AddCollectionForm onSuccess={() => setRefresh(r => !r)} />
      <CollectionsPage key={refresh ? "refresh1" : "refresh0"} />
    </div>
  );
}
