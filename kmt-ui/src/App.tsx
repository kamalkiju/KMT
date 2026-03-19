import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PocDocumentsProvider } from './context/PocDocumentsContext'
import { RsauiQueueProvider } from './context/RsauiQueueContext'
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PocDocumentsProvider>
          <RsauiQueueProvider>
            <AppRoutes />
          </RsauiQueueProvider>
        </PocDocumentsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
