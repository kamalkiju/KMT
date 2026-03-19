import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LoginPage } from '../pages/auth/LoginPage'
import { BufmDashboardPage } from '../pages/bufm/BufmDashboardPage'
import { BufmMonitoringPage } from '../pages/bufm/BufmMonitoringPage'
import { BufmReviewPage } from '../pages/bufm/BufmReviewPage'
import { BufmRsauiReviewPage } from '../pages/bufm/BufmRsauiReviewPage'
import { BufmUsersPage } from '../pages/bufm/BufmUsersPage'
import { KmtArchiveReviewPage } from '../pages/kmt/KmtArchiveReviewPage'
import { KmtArchivedPage } from '../pages/kmt/KmtArchivedPage'
import { KmtDashboardPage } from '../pages/kmt/KmtDashboardPage'
import { KmtExpiryQueuePage } from '../pages/kmt/KmtExpiryQueuePage'
import { KmtFinalReviewPage } from '../pages/kmt/KmtFinalReviewPage'
import { KmtGovernancePeekPage } from '../pages/kmt/KmtGovernancePeekPage'
import { KmtKnowledgeDocumentDetailPage } from '../pages/kmt/KmtKnowledgeDocumentDetailPage'
import { KmtKnowledgeReviewQueuePage } from '../pages/kmt/KmtKnowledgeReviewQueuePage'
import { KmtPublishedDocumentsPage } from '../pages/kmt/KmtPublishedDocumentsPage'
import { KmtPublishedPage } from '../pages/kmt/KmtPublishedPage'
import { KmtReportsPage } from '../pages/kmt/KmtReportsPage'
import { KmtRsauiDocumentPage } from '../pages/kmt/KmtRsauiDocumentPage'
import { KmtRsauiQueuePage } from '../pages/kmt/KmtRsauiQueuePage'
import { KmtTemplateBuilderPage } from '../pages/kmt/KmtTemplateBuilderPage'
import { KmtTemplateDetailPage } from '../pages/kmt/KmtTemplateDetailPage'
import { KmtTemplateAssignmentsPage } from '../pages/kmt/KmtTemplateAssignmentsPage'
import { KmtTemplatesManagementPage } from '../pages/kmt/KmtTemplatesManagementPage'
import { KmtUserDetailPage } from '../pages/kmt/KmtUserDetailPage'
import { KmtUsersPage } from '../pages/kmt/KmtUsersPage'
import { SettingsPage } from '../pages/SettingsPage'
import { PocDashboardPage } from '../pages/poc/PocDashboardPage'
import { PocDocumentBuilderPage } from '../pages/poc/PocDocumentBuilderPage'
import { PocReportsPage } from '../pages/poc/PocReportsPage'
import { PocRsaUiPage } from '../pages/poc/PocRsaUiPage'
import { PocTrainingPage } from '../pages/poc/PocTrainingPage'
import { PocProtectedLayout } from './PocProtectedLayout'
import { ProtectedLayout } from './ProtectedLayout'

function RedirectUserAccessProfile() {
  const { userId } = useParams<{ userId: string }>()
  return <Navigate to={`/kmt/governance/template-assignments/${userId}`} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/poc" element={<PocProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PocDashboardPage />} />
        <Route path="rsa-ui" element={<PocRsaUiPage />} />
        <Route path="reports" element={<PocReportsPage />} />
        <Route path="training" element={<PocTrainingPage />} />
        <Route path="document/:docId" element={<PocDocumentBuilderPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/bufm" element={<ProtectedLayout allowed="BUFM" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BufmDashboardPage />} />
        <Route path="users" element={<BufmUsersPage />} />
        <Route path="monitoring" element={<BufmMonitoringPage />} />
        <Route path="review/:id" element={<BufmReviewPage />} />
        <Route path="rsa-ui/:id" element={<BufmRsauiReviewPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/kmt" element={<ProtectedLayout allowed="KMT" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<KmtDashboardPage />} />
        <Route path="governance" element={<Navigate to="/kmt/knowledge/review" replace />} />
        <Route path="governance/peek/:id" element={<KmtGovernancePeekPage />} />
        <Route path="governance/templates/builder" element={<KmtTemplateBuilderPage />} />
        <Route path="governance/templates/:templateId" element={<KmtTemplateDetailPage />} />
        <Route path="governance/templates" element={<KmtTemplatesManagementPage />} />
        <Route path="governance/template-assignments/:userId" element={<KmtUserDetailPage />} />
        <Route path="governance/template-assignments" element={<KmtTemplateAssignmentsPage />} />
        <Route path="governance/user-access/:userId" element={<RedirectUserAccessProfile />} />
        <Route path="governance/user-access" element={<Navigate to="/kmt/governance/template-assignments" replace />} />
        <Route path="knowledge/document/:docId" element={<KmtKnowledgeDocumentDetailPage />} />
        <Route path="knowledge/review" element={<KmtKnowledgeReviewQueuePage />} />
        <Route path="knowledge/expiry" element={<KmtExpiryQueuePage />} />
        <Route path="knowledge/published" element={<KmtPublishedDocumentsPage />} />
        <Route path="knowledge/archived" element={<KmtArchivedPage />} />
        <Route path="users" element={<KmtUsersPage />} />
        <Route path="review/knowledge" element={<Navigate to="/kmt/knowledge/review" replace />} />
        <Route path="review/rsaui/:docId" element={<KmtRsauiDocumentPage />} />
        <Route path="review/rsaui" element={<KmtRsauiQueuePage />} />
        <Route path="review/:id" element={<KmtFinalReviewPage />} />
        <Route path="lifecycle/published" element={<Navigate to="/kmt/knowledge/published" replace />} />
        <Route path="lifecycle/expiry" element={<Navigate to="/kmt/knowledge/expiry" replace />} />
        <Route path="lifecycle/archived" element={<Navigate to="/kmt/knowledge/archived" replace />} />
        <Route path="lifecycle" element={<Navigate to="/kmt/knowledge/published" replace />} />
        <Route path="templates" element={<Navigate to="/kmt/governance/templates" replace />} />
        <Route path="templates/builder" element={<Navigate to="/kmt/governance/templates/builder" replace />} />
        <Route path="users-assignments" element={<Navigate to="/kmt/governance/template-assignments" replace />} />
        <Route path="archived" element={<Navigate to="/kmt/knowledge/archived" replace />} />
        <Route path="reports" element={<KmtReportsPage />} />
        <Route path="document/:docId" element={<PocDocumentBuilderPage />} />
        <Route path="published/:id" element={<KmtPublishedPage />} />
        <Route path="archive/:id" element={<KmtArchiveReviewPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
