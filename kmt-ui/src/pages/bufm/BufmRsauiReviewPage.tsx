import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import formStyles from '../../components/ui/FormField.module.css'
import { useRsauiQueue } from '../../context/RsauiQueueContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './BufmRsauiReviewPage.module.css'

export function BufmRsauiReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRsauiById, approveRsaui, rejectRsaui, addRsauiComment } = useRsauiQueue()
  const [comment, setComment] = useState('')
  const [rejectErr, setRejectErr] = useState(false)

  const item = useMemo(() => (id ? getRsauiById(id) : undefined), [getRsauiById, id])

  const onApprove = useCallback(() => {
    if (!item) return
    approveRsaui(item.id)
    navigate('/bufm/dashboard')
  }, [approveRsaui, item, navigate])

  const onReject = useCallback(() => {
    if (!item) return
    const t = comment.trim()
    if (!t) {
      setRejectErr(true)
      return
    }
    setRejectErr(false)
    rejectRsaui(item.id, t)
    navigate('/bufm/monitoring')
  }, [comment, item, navigate, rejectRsaui])

  const onAddComment = useCallback(() => {
    if (!item) return
    const t = comment.trim()
    if (!t) return
    addRsauiComment(item.id, t)
    setComment('')
  }, [addRsauiComment, comment, item])

  if (!id) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Missing id.</p>
          <Link to="/bufm/dashboard">
            <Button variant="secondary" type="button">
              Back
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!item) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>RSAUI request not found.</p>
          <Link to="/bufm/dashboard">
            <Button variant="secondary" type="button">
              Back
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (item.status !== 'pending') {
    return (
      <div className={styles.stack}>
        <Card>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.lead}>
            This request is already <strong>{item.status}</strong>.
          </p>
          <Link to="/bufm/monitoring">
            <Button variant="secondary" type="button">
              Monitoring
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/bufm/dashboard" label="BUFM dashboard" />
        <h1 className={styles.title}>RSAUI approval</h1>
        <p className={styles.lead}>{item.title}</p>

        {item.configOutdated ? (
          <div className={pageStyles.warnBanner} role="alert">
            Product configuration outdated. Please revalidate before approving.
          </div>
        ) : null}

        <div className={pageStyles.split}>
          <div className={pageStyles.main}>
            <section className={pageStyles.section}>
              <h2 className={pageStyles.h2}>Product details</h2>
              <p className={pageStyles.body}>{item.productDetails}</p>
            </section>
            <section className={pageStyles.section}>
              <h2 className={pageStyles.h2}>Pricing configuration</h2>
              <p className={pageStyles.body}>{item.pricingConfig}</p>
            </section>
            <section className={pageStyles.section}>
              <h2 className={pageStyles.h2}>Service area coverage</h2>
              <p className={pageStyles.body}>{item.coverage}</p>
            </section>
            <section className={pageStyles.section}>
              <h2 className={pageStyles.h2}>Change highlights</h2>
              <ul className={pageStyles.highlights}>
                {item.changeHighlights.length === 0 ? (
                  <li className={pageStyles.muted}>No structural changes flagged.</li>
                ) : (
                  item.changeHighlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <aside className={pageStyles.side}>
            <h3 className={pageStyles.sideTitle}>Comments</h3>
            <div className={pageStyles.thread}>
              {item.comments.length === 0 ? (
                <p className={pageStyles.muted}>No comments yet.</p>
              ) : (
                item.comments.map((c) => (
                  <div key={c.id} className={pageStyles.bubble}>
                    <div className={pageStyles.bubbleMeta}>
                      {c.role} · {new Date(c.at).toLocaleString()}
                    </div>
                    {c.body}
                  </div>
                ))
              )}
            </div>
            <FormField label="Your comment">
              <textarea
                className={formStyles.textarea}
                rows={4}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (rejectErr && e.target.value.trim()) setRejectErr(false)
                }}
                placeholder="Add context for POC (visible on reject)…"
              />
            </FormField>
            {rejectErr ? <p className={pageStyles.err}>Comment required to reject.</p> : null}
            <div className={styles.row}>
              <Button variant="primary" type="button" onClick={onApprove}>
                Approve
              </Button>
              <Button variant="danger" type="button" onClick={onReject}>
                Reject
              </Button>
              <Button variant="secondary" type="button" onClick={onAddComment}>
                Add comment
              </Button>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  )
}
