import Link from 'next/link'
import { Button } from 'antd'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-primary">ThesisTrack</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A centralized web application that streamlines the thesis/project proposal 
          submission and review process in academic institutions.
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/login">
            <Button type="primary" size="large" className="px-8">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="large" className="px-8">
              Sign Up
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Students</h3>
            <p className="text-gray-600">
              Submit and track your project proposals with real-time status updates 
              and feedback from supervisors.
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Teachers</h3>
            <p className="text-gray-600">
              Efficiently review student proposals, provide feedback, and manage 
              your supervised students in one place.
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">For Admins</h3>
            <p className="text-gray-600">
              Manage users, sessions, and system operations with comprehensive 
              analytics and reporting tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}