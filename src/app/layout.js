import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'

export const metadata = {
  title: 'ThesisTrack - Project Proposal & Review System',
  description: 'A centralized platform for thesis proposal submission and review',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  )
}