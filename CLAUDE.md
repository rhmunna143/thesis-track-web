# ThesisTrack Project Memory

## Project Overview
ThesisTrack is a centralized web application for managing thesis/project proposal submissions and reviews in academic institutions. Built with Next.js 14, Tailwind CSS, and Ant Design.

## Tech Stack
- **Frontend**: Next.js 14 (JavaScript, not TypeScript)
- **Styling**: Tailwind CSS + Ant Design
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts
- **Icons**: Ant Design icons + Lucide React
- **File Handling**: react-pdf for PDF viewing
- **Date Handling**: date-fns

## Project Structure
```
src/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Auth layout group
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── student/       # Student dashboard & features
│   │   ├── teacher/       # Teacher dashboard & features
│   │   └── admin/         # Admin dashboard & features
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.js         # Root layout with AntdRegistry
│   └── page.js           # Landing page
├── components/
│   ├── common/           # Shared components
│   │   ├── Header.js     # Dashboard header with breadcrumbs
│   │   └── Sidebar.js    # Dashboard sidebar navigation
│   ├── forms/           # Form components
│   ├── tables/          # Table components
│   └── charts/          # Chart components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── services/            # API service layer
│   ├── api.js          # Axios configuration with interceptors
│   └── auth.service.js # Authentication services
├── store/               # Zustand stores
│   ├── authStore.js    # Authentication state management
│   └── proposalStore.js # Proposal state management
└── styles/              # Additional styles
```

## Key Features Implemented

### Authentication System
- JWT-based authentication with Zustand persistence
- Role-based access control (STUDENT, TEACHER, ADMIN)
- Login/signup forms with validation
- Auto-redirect based on user roles
- Session management with token refresh

### User Roles & Permissions
- **Students**: Submit/track proposals, manage profile
- **Teachers**: Review proposals, manage students, view analytics
- **Admins**: Manage users/sessions, system analytics

### Student Features
- Dashboard with proposal statistics and recent activity
- Multi-step proposal submission form (5 steps):
  1. Basic Info (title, type, team members)
  2. Abstract & Details (methodology, keywords)
  3. Documentation (PDF upload, references)
  4. Supervisor Selection (primary/co-supervisor)
  5. Review & Submit
- Profile management with university email validation
- Proposal tracking with status visualization

### Teacher Features
- Dashboard showing pending reviews and metrics
- Proposal review interface
- Student management system
- Performance analytics

### Admin Features
- System overview dashboard
- User management interface
- Session management
- System analytics with charts (Recharts)
- Health monitoring

### Common Components
- Responsive sidebar navigation with role-based menu items
- Header with breadcrumbs and user dropdown
- Dashboard layout with authentication guard
- Form components with Ant Design integration

## State Management

### Auth Store (authStore.js)
```javascript
{
  user: Object,           // Current user data
  token: String,          // JWT token
  isAuthenticated: Boolean,
  login(userData, token), 
  logout(),
  updateProfile(data)
}
```

### Proposal Store (proposalStore.js)
```javascript
{
  proposals: Array,       // List of proposals
  selectedProposal: Object,
  filters: Object,        // Status, department, date filters
  loading: Boolean,
  fetchProposals(),
  createProposal(data),
  updateProposal(id, updates)
}
```

## API Integration
- Centralized Axios configuration with request/response interceptors
- Automatic token injection for authenticated requests
- Error handling with automatic logout on 401
- Service layer pattern for clean API interactions

## Styling & UI
- Tailwind CSS for utility-first styling
- Ant Design components for consistent UI
- Custom color palette matching PRD specifications
- Responsive design with mobile-first approach
- Inter font family for typography

## Key Pages Created
- `/` - Landing page
- `/login` - Authentication
- `/signup` - User registration  
- `/student` - Student dashboard
- `/student/profile` - Student profile management
- `/student/proposals/new` - Multi-step proposal form
- `/teacher` - Teacher dashboard
- `/admin` - Admin dashboard

## Mock Data Used
- Sample proposals with various statuses
- Mock supervisors with expertise areas
- User activity timelines
- System metrics and analytics data

## Security Features
- University email validation (.edu domain)
- File type and size validation for uploads
- XSS protection through proper data handling
- Role-based route access control

## Next Steps for Backend Integration
1. Connect to real API endpoints
2. Implement file upload functionality
3. Add real-time notifications
4. Integrate PDF viewing
5. Add email notification system
6. Implement search and filtering
7. Add batch operations for teachers/admins

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

### Required
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001/api)
- `NEXT_PUBLIC_IMGBB_API_KEY`: Imgbb API key for image uploads

### Optional
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)
- `ALLOWED_FILE_TYPES`: Comma-separated file extensions (default: pdf,doc,docx,jpg,jpeg,png)
- `NEXT_PUBLIC_APP_URL`: Frontend app URL (default: http://localhost:3000)
- `JWT_SECRET`: JWT secret for backend authentication
- `JWT_EXPIRES_IN`: JWT expiration time (default: 7d)

### Configuration Management
- Centralized config file: `src/lib/config.js`
- Environment validation on startup
- Feature flags for conditional functionality
- Academic constants (departments, proposal types, user roles)
- Validation rules (password strength, proposal limits)

### File Upload System
- **Upload Service**: `src/services/upload.service.js`
- **Imgbb Integration**: For image uploads (profile pictures)
- **File Validation**: Type and size validation based on config
- **Mock Upload**: For non-image files (development mode)
- **Profile Images**: Separate validation rules and size limits

## Notes
- Using JavaScript instead of TypeScript per user preference
- Simple UI implementation ready for customization
- All components are functional components with hooks
- Responsive design implemented throughout
- Ready for backend API integration