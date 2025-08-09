import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import ErrorBoundary from '../components/common/ErrorBoundary'

export const metadata = {
  title: 'ThesisTrack - Project Proposal & Review System',
  description: 'A centralized platform for thesis proposal submission and review',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AntdRegistry>
            {children}
          </AntdRegistry>
        </ErrorBoundary>
      </body>
    </html>
  )
}