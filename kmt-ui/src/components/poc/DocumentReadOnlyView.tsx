import type { PocDocument } from '../../types/pocDocument'
import { DocumentReadOnlyTabPanel } from './DocumentReadOnlyTabPanel'
import styles from './DocumentReadOnlyView.module.css'

interface DocumentReadOnlyViewProps {
  doc: PocDocument
}

/** Full document: every tab stacked (BUFM preview, legacy read-only). */
export function DocumentReadOnlyView({ doc }: DocumentReadOnlyViewProps) {
  return (
    <div className={styles.root}>
      {doc.tabs.map((tab) => (
        <DocumentReadOnlyTabPanel key={tab.id} tab={tab} showTabTitle />
      ))}
    </div>
  )
}
