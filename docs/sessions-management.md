# Academic Sessions Management

## Overview
The Academic Sessions Management page provides comprehensive functionality for managing academic sessions in the ThesisTrack system. This is designed for administrators to create, manage, and monitor academic periods (semesters/terms) during which students can submit proposals.

## Features

### 📊 Dashboard Overview
- **Statistics Cards**: Display total sessions, active sessions, completed sessions, total proposals, and average proposals per session
- **Active Session Banner**: Prominently displays the currently active session with creation date and quick analytics access
- **Real-time Data**: Automatically updates when sessions are modified

### 🔧 Session Management

#### Create Session
- Create new academic sessions with custom names (e.g., "Spring 2025", "Fall 2024")
- Set initial active/inactive status
- Automatic validation to ensure only one session is active at a time

#### Edit Session
- Update session name
- Change active/inactive status
- Form validation for data integrity

#### Session Actions
- **Activate/Deactivate**: Toggle session status with visual feedback
- **Archive**: Archive completed sessions (irreversible)
- **Clone**: Create new sessions based on existing ones
- **Delete**: Remove sessions entirely (with confirmation)

#### View Details
- Comprehensive session information display
- Session analytics including:
  - Total proposals submitted
  - Approved proposals count
  - Pending proposals count
- Creation and modification timestamps

### 📋 Table Features

#### Data Display
- Session name and ID
- Status indicators (Active/Inactive/Archived) with color coding
- Proposal and student counts per session
- Creation dates with time information
- Sortable columns

#### Filtering
- Filter by status (Active/Inactive/Archived)
- Sort by creation date, proposal count, student count
- Real-time search functionality

#### Actions Column
- Quick view details button
- Activate/Deactivate toggle
- Dropdown menu with additional actions:
  - Edit session
  - Clone session
  - Archive session
  - Delete session

### 🎨 UI/UX Features

#### Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly interactions

#### Visual Feedback
- Color-coded status indicators
- Loading states for all async operations
- Success/error messages for user actions
- Hover effects and smooth transitions

#### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast color schemes
- Tooltips for better user guidance

## Technical Implementation

### Backend Integration
- Full integration with `sessionService` API
- Error handling with fallback states
- Real-time data synchronization
- Optimistic UI updates

### State Management
- Local component state for UI interactions
- Global auth store integration
- Efficient re-rendering with React hooks

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Graceful degradation for network issues
- Fallback data for offline scenarios

## API Endpoints Used

```javascript
// Session Management
GET    /sessions              // Get all sessions
GET    /sessions/active       // Get current active session
POST   /sessions              // Create new session
PUT    /sessions/:id          // Update session
DELETE /sessions/:id          // Delete session
PATCH  /sessions/:id/activate // Activate session
PATCH  /sessions/:id/deactivate // Deactivate session
PATCH  /sessions/:id/archive  // Archive session
POST   /sessions/:id/clone    // Clone session

// Analytics
GET    /analytics/sessions/:id // Get session analytics
```

## Styling

### CSS Classes
- **sessions-management-page**: Main container styling
- **active-session-banner**: Highlighted active session display
- **status-active/inactive/archived**: Status-specific styling
- **action-buttons**: Consistent button styling
- **session-details-grid**: Grid layout for session details

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Security Considerations

### Access Control
- Admin-only functionality
- JWT token validation
- Role-based permissions

### Data Validation
- Input sanitization
- Form validation
- Server-side validation backup

## Performance Optimizations

### React Optimizations
- Memoized components where appropriate
- Efficient re-rendering
- Debounced search functionality

### API Optimizations
- Efficient data fetching
- Minimal API calls
- Caching strategies

## Usage Examples

### Creating a New Session
1. Click "Create Session" button
2. Enter session name (e.g., "Spring 2025")
3. Set active status if needed
4. Click "Create Session"

### Managing Active Session
1. View current active session in banner
2. Use activate/deactivate buttons for quick status changes
3. Only one session can be active at a time

### Cloning Sessions
1. Click actions dropdown for source session
2. Select "Clone Session"
3. Enter new session name
4. New session created as inactive

### Viewing Analytics
1. Click "View Details" for any session
2. Review session statistics
3. Analyze proposal submission patterns

## File Structure

```
src/app/(dashboard)/admin/sessions/
├── page.js                 // Main sessions management component
└── styles/
    └── session-management.css  // Dedicated styling

src/services/
└── session.service.js      // API integration layer

src/hooks/
└── useErrorHandler.js      // Error handling hook
```

## Dependencies

- **React**: Core framework
- **Ant Design**: UI components
- **date-fns**: Date formatting
- **Zustand**: State management
- **Axios**: HTTP client

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Last Updated**: August 24, 2025  
**Status**: Production Ready  
**Features**: Complete CRUD operations, real-time updates, comprehensive error handling
