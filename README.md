# ThesisTrack - Project Proposal & Review System

A centralized web application that streamlines the thesis/project proposal submission and review process in academic institutions.

## 🚀 Features

### For Students
- **Multi-step Proposal Submission**: Guided 5-step form with validation
- **Real-time Tracking**: Monitor proposal status and feedback
- **Profile Management**: Complete academic profile with research interests
- **File Upload**: Support for PDF documents and supporting materials

### For Teachers  
- **Review Dashboard**: Efficient proposal review interface
- **Student Management**: Track supervised students and their progress
- **Analytics**: Performance metrics and review statistics
- **Batch Operations**: Review multiple proposals efficiently

### For Administrators
- **User Management**: Create and manage student/teacher accounts
- **System Analytics**: Comprehensive dashboard with charts and metrics
- **Session Management**: Configure academic sessions and deadlines
- **System Monitoring**: Health monitoring and system status

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (JavaScript)
- **Styling**: Tailwind CSS + Ant Design
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Yup validation
- **Charts**: Recharts
- **File Upload**: Imgbb API integration
- **Icons**: Ant Design Icons + Lucide React

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone [your-repository-url]
cd thesis-track
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# File Upload Service (Imgbb)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here

# JWT Configuration (for future backend)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔥 Build Issues Fixed

The following build issues have been resolved:

✅ **Tailwind CSS Configuration**
- Fixed PostCSS plugin compatibility issue
- Downgraded to Tailwind CSS v3.4.17 for stability
- Removed undefined CSS classes (`border-border`, `bg-background`, etc.)
- Updated to use standard Tailwind utility classes

✅ **Next.js Configuration**  
- Removed deprecated `experimental.appDir` option
- Fixed image domains configuration for Imgbb uploads

✅ **CSS Classes**
- Replaced custom undefined classes with standard Tailwind utilities
- Fixed color references to use actual Tailwind color palette
- Updated component styles for better compatibility

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Dashboard pages
│   │   ├── student/       # Student features
│   │   ├── teacher/       # Teacher features
│   │   └── admin/         # Admin features
│   ├── globals.css        # Global styles
│   ├── layout.js         # Root layout
│   └── page.js           # Landing page
├── components/
│   └── common/           # Shared components
├── lib/
│   └── config.js         # App configuration
├── services/             # API services
│   ├── api.js           # Axios configuration
│   ├── auth.service.js  # Authentication
│   └── upload.service.js # File uploads
├── store/               # Zustand stores
│   ├── authStore.js    # Authentication state
│   └── proposalStore.js # Proposal management
└── styles/             # Additional styles
```

## 🌟 Key Features Implemented

### Authentication System
- JWT-based authentication with persistent storage
- Role-based access control (Student/Teacher/Admin)
- University email validation
- Automatic redirects based on user roles

### File Upload System
- Imgbb API integration for image uploads
- File validation (type, size limits)
- Support for profile images and documents
- Configurable upload limits

### Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Ant Design components
- Consistent UI/UX across devices

### State Management
- Zustand for simple state management
- Persistent authentication state
- Optimistic UI updates
- Error handling

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` | ✅ |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Imgbb API key for file uploads | - | ✅ |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `http://localhost:3000` | ❌ |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) | ❌ |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,doc,docx,jpg,jpeg,png` | ❌ |

## 📱 User Roles & Access

### Student Access
- `/student` - Dashboard
- `/student/profile` - Profile management
- `/student/proposals` - Proposal listing
- `/student/proposals/new` - New proposal submission

### Teacher Access  
- `/teacher` - Dashboard
- `/teacher/proposals` - Review proposals
- `/teacher/students` - Manage students
- `/teacher/analytics` - View analytics

### Admin Access
- `/admin` - System dashboard  
- `/admin/users` - User management
- `/admin/sessions` - Session management
- `/admin/analytics` - System analytics

## 🎨 UI Components

The application uses Ant Design components with custom Tailwind CSS styling:

- **Color Palette**: Blue primary, green success, red danger
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Breakpoints**: Mobile-first responsive design

## 🚧 Development Status

### ✅ Completed
- Project setup and architecture
- Authentication system
- Student proposal submission
- Teacher review interface (basic)
- Admin dashboard
- File upload system
- Responsive design

### 🔄 In Progress
- Backend API integration
- Real-time notifications
- Advanced search and filtering

### 📋 Planned
- Email notifications
- PDF viewer integration
- Advanced analytics
- Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs)
2. Search existing [issues](https://github.com/your-username/thesis-track/issues)
3. Create a new issue if needed

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Ant Design](https://ant.design/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Zustand](https://zustand-demo.pmnd.rs/) for state management

---

Made with ❤️ for academic institutions