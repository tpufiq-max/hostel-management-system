# Quick Start Guide - Enhanced UI Features

## 🚀 Getting Started

Your Hostel Management System now includes advanced interactive pages and modern UI components. Here's how to use them:

---

## 📍 New Pages Location

### Access via Sidebar
1. **Analytics** → `/analytics` - View performance metrics
2. **Financial** → `/financial` - Revenue and expenses
3. **Student Profiles** → `/student-profiles` - Student details
4. **Maintenance** → `/maintenance` - Maintenance requests
5. **Events** → `/events` - Event calendar

---

## 🎯 Using New Components in Your Code

### StatCard - Display Metrics
```javascript
import StatCard from './components/common/StatCard';

<StatCard
  title="Active Students"
  value={245}
  icon="👥"
  color="blue"
  trend={{ isPositive: true, percentage: 12, label: 'this month' }}
/>
```

### Button - Enhanced Controls
```javascript
import Button from './components/common/Button';

<Button variant="primary" size="md" fullWidth>
  Click Me
</Button>

// With loading state
<Button loading={true} variant="success">
  Processing...
</Button>
```

### Badge - Status Indicators
```javascript
import Badge from './components/common/Badge';

<Badge text="Active" variant="success" icon="✓" />
<Badge text="Pending" variant="warning" glowing={true} />
```

### ProgressBar - Visual Progress
```javascript
import ProgressBar from './components/common/ProgressBar';

<ProgressBar percentage={75} color="green" />
```

### Alert - Important Messages
```javascript
import Alert from './components/common/Alert';

<Alert 
  title="Success"
  message="Operation completed successfully"
  type="success"
  dismissible
/>
```

### Tabs - Organize Content
```javascript
import Tabs from './components/common/Tabs';

const tabs = [
  { label: 'Overview', icon: '📊', content: <Overview /> },
  { label: 'Details', icon: '📝', content: <Details /> }
];

<Tabs tabs={tabs} defaultTab={0} />
```

### useNotification - Toast Messages
```javascript
import { useNotification } from './hooks/useNotification';

const { success, error, warning } = useNotification();

// In your component
<button onClick={() => success('Saved successfully!')}>
  Save
</button>
```

---

## 🎨 Color Variants Reference

### For StatCard
- `blue` - Default, info metrics
- `green` - Success, positive metrics
- `red` - Alerts, negative metrics
- `yellow` - Warnings
- `purple` - Special metrics
- `indigo` - Additional metrics

### For Badge
- `default`, `primary`, `success`, `warning`, `danger`, `purple`, `pink`

### For ProgressBar
- `blue`, `green`, `red`, `yellow`, `purple`

### For Alert
- `info`, `success`, `warning`, `error`

---

## 🎬 Animation Classes

Use these in any component for animations:

```html
<!-- Slide in from right -->
<div class="animate-slideIn">Content</div>

<!-- Slide up animation -->
<div class="animate-slideInUp">Content</div>

<!-- Fade in -->
<div class="animate-fadeIn">Content</div>

<!-- Pulse effect -->
<div class="animate-pulse">Loading...</div>

<!-- Bounce -->
<div class="animate-bounce">Bouncing!</div>

<!-- Glowing effect -->
<div class="animate-glow">Important!</div>
```

---

## 📊 Common Patterns

### Creating a Metric Card
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard title="Total" value={100} icon="📊" color="blue" />
  <StatCard title="Active" value={85} icon="✓" color="green" />
  <StatCard title="Pending" value={15} icon="⏳" color="yellow" />
  <StatCard title="Issues" value={3} icon="⚠️" color="red" />
</div>
```

### Creating a Status Chip
```javascript
<Badge 
  text={status === 'active' ? 'Active' : 'Inactive'}
  variant={status === 'active' ? 'success' : 'warning'}
  icon={status === 'active' ? '✓' : '○'}
/>
```

### Creating a Notification
```javascript
import { useNotification } from './hooks/useNotification';

function MyComponent() {
  const { success, error } = useNotification();
  
  const handleSave = async () => {
    try {
      // Save logic
      success('Saved successfully!');
    } catch (err) {
      error('Failed to save');
    }
  }
  
  return <Button onClick={handleSave}>Save</Button>;
}
```

---

## 🎯 Page-Specific Features

### Analytics Dashboard
- **Time Range Filter**: Week/Month/Year
- **Metrics Display**: Revenue, occupancy, complaints
- **Charts**: Bar charts for trends, progress bars for distribution
- **Summary Cards**: Quick overview of key metrics

### Student Profiles
- **Search**: Find students by name or email
- **Filter**: Sort by name, room, or status
- **Modal View**: Detailed student information
- **Contact Info**: Quick access to student details
- **Financial Status**: Outstanding balance tracking

### Maintenance Requests
- **Report New**: Create maintenance requests
- **Filter by Status**: Open, In Progress, Completed
- **Priority Levels**: High, Medium, Low
- **Categories**: Plumbing, Electrical, Hardware, etc.
- **Assignment Tracking**: See assigned staff

### Event Calendar
- **Month Navigation**: Browse past/future months
- **Color-Coded Events**: Different colors for different event types
- **Event Details**: Click events for more information
- **Add Event**: Create new events
- **Upcoming View**: Sidebar showing upcoming events

### Financial Dashboard
- **Key Metrics**: Revenue, expenses, net income, outstanding
- **Transactions**: Recent financial transactions
- **Pending Collections**: Track overdue payments
- **Expense Breakdown**: Visual breakdown of costs
- **Export**: Generate reports and export data

---

## 🔧 Customization Tips

### Change Colors
```javascript
// In any component using StatCard
<StatCard color="purple" ... />
```

### Add Icons to Buttons
```javascript
// Button with icon
<Button icon={MyIcon}>Click me</Button>
```

### Customize Badge Size
```javascript
<Badge text="Active" size="lg" /> <!-- sm, md, lg -->
```

### Modify Progress Bar Height
```javascript
<ProgressBar percentage={75} height="h-4" />
```

---

## 🐛 Troubleshooting

### Animations Not Playing
- Check if `prefers-reduced-motion` is enabled
- Verify CSS is loaded: `styles/global.css`
- Check browser console for errors

### Notifications Not Appearing
- Ensure `NotificationContainer` is in your Layout
- Check `useNotification` hook is properly imported
- Verify notifications state is connected

### Sidebar Icons Not Showing
- Confirm SVG icons are properly defined in Sidebar.jsx
- Check icon names match between NAV_ITEMS and ICONS

---

## 📱 Responsive Design

All components are fully responsive:
- **Mobile**: Stack vertically, full-width buttons
- **Tablet**: 2-column grid for cards
- **Desktop**: 3-4 column grid for cards
- **Sidebar**: Collapses on mobile, full-width on desktop

---

## 🎓 Examples

### Complete Feature Example
```javascript
import React, { useState } from 'react';
import StatCard from './components/common/StatCard';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import { useNotification } from './hooks/useNotification';

export default function Dashboard() {
  const { success } = useNotification();
  
  const handleAction = () => {
    success('Action completed!');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total" value={245} icon="👥" color="blue" />
        <StatCard title="Active" value={238} icon="✓" color="green" />
      </div>
      
      <div className="flex gap-2">
        <Badge text="Active" variant="success" />
        <Badge text="Verified" variant="info" />
      </div>
      
      <Button onClick={handleAction} variant="primary">
        Take Action
      </Button>
    </div>
  );
}
```

---

## ✅ Best Practices

1. **Use StatCard** for displaying key metrics
2. **Use Badge** for status indicators
3. **Use Button** variants for consistency
4. **Use useNotification** for user feedback
5. **Use Alert** for important messages
6. **Use ProgressBar** for tracking progress
7. **Maintain color consistency** across pages
8. **Test responsive design** on mobile

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review component source code
3. Check browser console for errors
4. Review UI_ENHANCEMENTS.md for details

---

**Happy Building!** 🚀

For more details, check **UI_ENHANCEMENTS.md** in the project root.
