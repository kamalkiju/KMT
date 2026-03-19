import { BuilderFieldPreview } from './BuilderFieldPreview'
import type { BuilderTab } from '../../types/pocDocument'
import styles from './DocumentReadOnlyView.module.css'

export interface DocumentReadOnlyTabPanelProps {
  tab: BuilderTab
  /** When false, hide the tab title heading (e.g. stepper already shows the title). */
  showTabTitle?: boolean
}

export function DocumentReadOnlyTabPanel({
  tab,
  showTabTitle = true,
}: DocumentReadOnlyTabPanelProps) {
  const tabBarFields = tab.groups.flatMap((g) =>
    g.fields.filter((f) => f.kind === 'Button' && f.buttonPlacement === 'tab_bar'),
  )
  const tabBarLeft = tabBarFields.filter((f) => f.tabBarButtonAlign !== 'end')
  const tabBarRight = tabBarFields.filter((f) => f.tabBarButtonAlign === 'end')

  return (
    <section
      className={`${styles.tabSection} ${showTabTitle ? '' : styles.tabSectionCompact}`}
    >
      {showTabTitle ? <h3 className={styles.tabTitle}>{tab.title}</h3> : null}
      {tabBarFields.length > 0 ? (
        <div className={styles.tabBar}>
          <div className={styles.tabBarLeft}>
            {tabBarLeft.map((f) => (
              <BuilderFieldPreview key={f.id} field={f} disabled viewAsDocument compact />
            ))}
          </div>
          <div className={styles.tabBarRight}>
            {tabBarRight.map((f) => (
              <BuilderFieldPreview key={f.id} field={f} disabled viewAsDocument compact />
            ))}
          </div>
        </div>
      ) : null}
      {tab.groups.map((group) => (
        <div key={group.id} className={styles.group}>
          <h4 className={styles.groupTitle}>{group.title}</h4>
          <div
            className={group.columns === 2 ? `${styles.grid} ${styles.grid2}` : styles.grid}
          >
            {group.fields.map((f) => {
              if (f.kind === 'Button' && f.buttonPlacement === 'tab_bar') {
                return null
              }
              const full =
                (f.kind === 'Button' && f.buttonPlacement === 'full_width') || f.kind === 'Notes'
              return (
                <div key={f.id} className={full ? styles.full : styles.cell}>
                  <BuilderFieldPreview field={f} disabled viewAsDocument />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
