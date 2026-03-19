import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import styles from '../shared/rolePages.module.css'

export function PocRsaUiPage() {
  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>RSAUI Tool</h1>
        <p className={styles.lead}>
          Update product configuration, pricing, and service categories. When GIS coverage is
          missing, the document creation flow blocks until you open the GIS tool and resolve
          territory data (enterprise pattern — simulated here).
        </p>
        <div className={styles.row}>
          <Button
            variant="primary"
            type="button"
            onClick={() =>
              window.open('https://example.com/rsa-ui', '_blank', 'noopener,noreferrer')
            }
          >
            Open RSAUI (demo link)
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              window.open('https://example.com/gis', '_blank', 'noopener,noreferrer')
            }
          >
            Open GIS Tool (demo link)
          </Button>
        </div>
      </Card>
    </div>
  )
}
