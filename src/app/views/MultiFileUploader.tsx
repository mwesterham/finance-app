import RulesTableUploader from "../components/RulesTableUploader";
import TransactionTableUploader from "../components/TransactionTableUploader";

interface MultiFileUploaderProps {
}

export default function MultiFileUploader(props: MultiFileUploaderProps) {
  return <>
    <TransactionTableUploader />
    <RulesTableUploader />
  </>;
}
