# Product Requirements Document (PRD) - Frontend
## ThesisTrack: Project Proposal & Book Review System

---

## 1. Executive Summary

### Product Overview
ThesisTrack is a centralized web application that streamlines the thesis/project proposal submission and review process in academic institutions. The frontend provides an intuitive interface for students, teachers, and administrators to manage the entire proposal lifecycle.

### Target Users
- **Students**: Submit and track project proposals
- **Teachers**: Review and approve student proposals
- **Administrators**: Manage system operations and user assignments

### Key Business Goals
- Replace manual/email-based proposal systems
- Reduce proposal review time by 70%
- Improve transparency in the approval process
- Centralize academic project management

---

## 2. User Personas & Journeys

### 2.1 Student Persona
**Name**: Sarah Chen  
**Age**: 22  
**Tech Savvy**: Medium  
**Goals**: Submit thesis proposal, get quick approval, track status  
**Pain Points**: Unclear submission requirements, lost emails, no status visibility

**User Journey**:
1. Signs up with university email
2. Completes profile with department and batch info
3. Creates new proposal with title and abstract
4. Uploads proposal PDF document
5. Selects preferred supervisor from dropdown
6. Submits proposal for review
7. Receives email notification on status changes
8. Views comments and feedback from supervisor
9. Updates proposal if revision required
10. Downloads approval certificate when approved

### 2.2 Teacher Persona
**Name**: Dr. Robert Kim  
**Age**: 45  
**Tech Savvy**: Low-Medium  
**Goals**: Efficiently review proposals, provide feedback, track supervised students  
**Pain Points**: Too many email requests, no central tracking, duplicate submissions

**User Journey**:
1. Logs in to dashboard
2. Views pending proposals count
3. Opens proposal details with PDF preview
4. Reviews student profile and academic history
5. Adds comments for specific sections
6. Approves/rejects/requests revision
7. Tracks all supervised students in one place
8. Views analytics on approval rates

### 2.3 Admin Persona
**Name**: Ms. Jennifer Park  
**Age**: 38  
**Tech Savvy**: High  
**Goals**: Manage system efficiently, generate reports, ensure smooth operations  
**Pain Points**: Manual user management, no system insights, assignment conflicts

**User Journey**:
1. Creates new academic session
2. Bulk imports users via CSV
3. Assigns teachers to departments
4. Monitors system analytics
5. Reassigns proposals when needed
6. Generates semester reports
7. Manages user roles and permissions

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

#### 3.1.1 Sign Up Flow
- **Public Registration** (`/signup`)
  - Email validation with university domain
  - Password strength indicator
  - Terms acceptance checkbox
  - Email verification link
  - Default role: STUDENT

#### 3.1.2 Login Flow
- **JWT-based authentication**
  - Remember me option (365 days token)
  - Forgot password with email reset
  - Role-based redirect after login
  - Session timeout warning (30 min before expiry)

#### 3.1.3 Authorization Matrix
| Feature | Student | Teacher | Admin |
|---------|---------|---------|--------|
| Submit Proposal | ✅ | ❌ | ❌ |
| View Own Proposals | ✅ | ❌ | ❌ |
| Review Proposals | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Create Sessions | ❌ | ❌ | ✅ |
| View All Analytics | ❌ | Partial | ✅ |

### 3.2 Student Features

#### 3.2.1 Profile Management
- **Required Fields**:
  - Full name
  - Department (dropdown)
  - Batch/Admission year
  - Student ID
  - Contact number
  - Profile picture (Imgbb API upload)
  
- **Optional Fields**:
  - Bio/About
  - Research interests
  - LinkedIn profile
  - Previous projects

#### 3.2.2 Proposal Submission
- **Multi-step Form**:
  1. **Step 1**: Basic Info
     - Project title (max 200 chars)
     - Project type (Thesis/Capstone/Research)
     - Team members (if group project)
  
  2. **Step 2**: Details
     - Abstract (500-1000 words)
     - Keywords (comma-separated)
     - Research methodology
  
  3. **Step 3**: Documentation
     - Proposal PDF upload (max 10MB)
     - Supporting documents (optional)
     - References/Bibliography
  
  4. **Step 4**: Supervisor Selection
     - Search/filter teachers by department
     - View teacher profiles and expertise
     - Select primary supervisor
     - Add co-supervisor (optional)
  
  5. **Step 5**: Review & Submit
     - Preview all information
     - Edit any section
     - Acknowledge submission guidelines
     - Submit button with loading state

#### 3.2.3 Proposal Tracking
- **Dashboard Cards**:
  - Total proposals submitted
  - Pending reviews
  - Approved proposals
  - Revision required
  
- **Proposal List View**:
  - Status badges (color-coded)
  - Submission date
  - Last updated
  - Supervisor name
  - Quick actions (View/Edit/Delete)
  
- **Detailed View**:
  - Complete proposal information
  - Status timeline/history
  - Comments thread
  - File downloads
  - Print option

#### 3.2.4 Project Book Submission
- **Requirements**:
  - Only after proposal approval
  - Complete project documentation
  - Final presentation slides
  - Source code repository link (if applicable)

### 3.3 Teacher Features

#### 3.3.1 Dashboard Analytics
- **Key Metrics**:
  - Pending reviews count (prominent)
  - Total supervised students
  - Average review time
  - Approval rate percentage
  - Department-wise distribution

#### 3.3.2 Proposal Review Interface
- **List View Filters**:
  - Status (Pending/Reviewed)
  - Department
  - Submission date range
  - Student name search
  - Batch/Year
  
- **Review Actions**:
  - Open PDF in modal/new tab
  - Side-by-side view (proposal + review form)
  - Inline commenting on specific sections
  - Quick approve/reject buttons
  - Request revision with detailed feedback
  
- **Batch Operations**:
  - Select multiple proposals
  - Bulk approve (with confirmation)
  - Export selected to Excel

#### 3.3.3 Student Management
- **Features**:
  - View all supervised students
  - Student profile quick view
  - Academic history
  - Previous proposals
  - Contact student (via system message)

### 3.4 Admin Features

#### 3.4.1 User Management
- **CRUD Operations**:
  - Create users (individual or bulk CSV)
  - View all users with pagination
  - Edit user details and roles
  - Deactivate/activate accounts
  - Password reset for users
  
- **Bulk Import Format**:
  ```csv
  name,email,role,department
  John Doe,john@university.edu,STUDENT,Computer Science
  ```

#### 3.4.2 Session Management
- **Academic Session**:
  - Create new session (Spring/Fall + Year)
  - Set active session
  - Archive old sessions
  - Session-wise reports
  
- **Configuration**:
  - Proposal submission deadline
  - Review deadline
  - Maximum proposals per student
  - Department-wise teacher limits

#### 3.4.3 System Analytics
- **Dashboard Widgets**:
  - Total users by role (pie chart)
  - Proposals by status (bar chart)
  - Monthly submission trends (line graph)
  - Department-wise statistics (table)
  - Teacher workload distribution (heatmap)

#### 3.4.4 Assignment Management
- **Features**:
  - Assign/reassign supervisors
  - Load balancing view
  - Conflict resolution
  - Emergency reassignment

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time: < 2 seconds
- API response time: < 500ms
- Support 1000+ concurrent users
- File upload: Support up to 10MB PDFs
- Real-time status updates

### 4.2 Security
- HTTPS only
- JWT stored in httpOnly cookies
- XSS protection
- CSRF tokens
- Rate limiting on API calls
- File type validation
- SQL injection prevention

### 4.3 Usability
- Mobile responsive (breakpoints: 640px, 768px, 1024px)
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Multi-language support (future)
- Offline mode for form drafts

### 4.4 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 5. UI/UX Specifications

### 5.1 Design System

#### Color Palette
```css
--primary: #3B82F6;      /* Blue */
--secondary: #10B981;    /* Green */
--danger: #EF4444;       /* Red */
--warning: #F59E0B;      /* Amber */
--info: #06B6D4;        /* Cyan */
--dark: #1F2937;        /* Gray-800 */
--light: #F9FAFB;       /* Gray-50 */
```

#### Typography
- **Headings**: Inter, system-ui
- **Body**: Inter, system-ui
- **Code**: 'Courier New', monospace

#### Component Library
- **UI Framework**: Tailwind CSS
- **Components**: Ant Design
- **Icons**: Heroicons / Lucide
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Tables**: TanStack Table

### 5.2 Layout Structure

#### Navigation
- **Desktop**: Fixed sidebar (collapsible)
- **Mobile**: Bottom navigation bar
- **Breadcrumbs**: Show current location
- **Quick actions**: Floating action button

#### Page Templates
1. **Auth Layout**: Centered card, gradient background
2. **Dashboard Layout**: Sidebar + main content
3. **Form Layout**: Progress indicator + form sections
4. **Table Layout**: Filters + sortable columns + pagination

### 5.3 Responsive Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

---

## 6. Technical Architecture

### 6.1 Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.x |
| Language | JavaScript | ES6+ |
| State Management | Zustand | 4.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | Ant Design | 5.x |
| Forms | React Hook Form | 7.x |
| HTTP Client | Axios | 1.x |
| Date Handling | date-fns | 2.x |
| PDF Viewer | react-pdf | 7.x |
| Charts | Recharts | 2.x |

### 6.2 Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth layout group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── student/
│   │   ├── teacher/
│   │   └── admin/
│   └── api/               # API routes (if needed)
├── components/
│   ├── common/            # Shared components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   └── charts/            # Chart components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── services/              # API service layer
├── store/                 # Zustand stores
├── styles/                # Global styles
└── types/                 # TypeScript types
```

### 6.3 State Management

#### Zustand Stores
```javascript
// authStore
- user
- token
- isAuthenticated
- login()
- logout()
- updateProfile()

// proposalStore
- proposals[]
- selectedProposal
- filters
- fetchProposals()
- createProposal()
- updateProposal()

// uiStore
- sidebarOpen
- theme
- notifications[]
- toggleSidebar()
- addNotification()
```

### 6.4 API Integration

#### Service Layer Pattern
```javascript
// services/api.js
- Base configuration
- Request interceptors
- Response interceptors
- Error handling

// services/auth.service.js
- login(credentials)
- signup(userData)
- logout()
- refreshToken()

// services/proposal.service.js
- getProposals(filters)
- createProposal(data)
- updateProposalStatus(id, status)
- addComment(proposalId, comment)
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and configuration
- [ ] Authentication implementation
- [ ] Basic layouts and routing
- [ ] Common components

### Phase 2: Student Module (Week 3-4)
- [ ] Profile management
- [ ] Proposal submission form
- [ ] Dashboard and tracking
- [ ] File upload integration

### Phase 3: Teacher Module (Week 5-6)
- [ ] Review interface
- [ ] Comments system
- [ ] Analytics dashboard
- [ ] Batch operations

### Phase 4: Admin Module (Week 7-8)
- [ ] User management
- [ ] Session management
- [ ] System analytics
- [ ] Assignment features

### Phase 5: Polish & Testing (Week 9-10)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User acceptance testing

---

## 8. Success Metrics

### 8.1 User Adoption
- 80% of students using the system within first semester
- 90% of teachers actively reviewing through platform
- < 5% bounce rate on landing page

### 8.2 Performance KPIs
- Average proposal review time: < 48 hours
- System uptime: 99.9%
- User satisfaction score: > 4.5/5

### 8.3 Business Impact
- 70% reduction in manual paperwork
- 50% faster approval process
- 90% reduction in lost proposals

---

## 9. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low teacher adoption | Medium | High | Training sessions, intuitive UI |
| File upload failures | Low | Medium | Retry mechanism, progress indicator |
| Session timeout issues | Medium | Low | Auto-save drafts, warning messages |
| Browser compatibility | Low | Medium | Progressive enhancement, polyfills |

---

## 10. Future Enhancements

### Version 2.0
- Mobile native apps (iOS/Android)
- AI-powered proposal suggestions
- Plagiarism detection integration
- Video presentation submissions
- Peer review system
- Multi-language support
- Advanced analytics with ML insights
- Integration with university LMS
- Automated report generation
- Meeting scheduler for defense