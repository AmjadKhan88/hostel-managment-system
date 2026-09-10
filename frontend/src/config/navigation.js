import {
  LayoutDashboard,
  Users,
  BedDouble,
  ClipboardList,
  Wallet,
  MessageSquareWarning,
  Wrench,
  Contact,
  UserCheck,
  BarChart3,
  Settings,
} from 'lucide-react';

/**
 * Sidebar navigation structure. Only items with a `path` are wired to a
 * real route — everything else renders disabled with a "Soon" badge until
 * its module is implemented on its own scoped day (no fake finished nav).
 * `permission`, once set, hides/disables the item for users who lack it.
 */
export const navSections = [
  {
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Residents', icon: Users, permission: 'student.read' },
      { label: 'Rooms & Beds', icon: BedDouble, path: '/rooms', permission: 'room.read' },
      { label: 'Admissions', icon: ClipboardList },
      { label: 'Complaints', icon: MessageSquareWarning, permission: 'complaints.read' },
      { label: 'Maintenance', icon: Wrench, permission: 'maintenance.read' },
      { label: 'Visitors', icon: Contact, permission: 'visitors.manage' },
    ],
  },
  {
    title: 'Finances',
    items: [{ label: 'Fees & Payments', icon: Wallet, permission: 'payments.read' }],
  },
  {
    title: 'Organization',
    items: [
      { label: 'Staff', icon: UserCheck, permission: 'staff.manage' },
      { label: 'Reports', icon: BarChart3, permission: 'reports.read' },
    ],
  },
];

export const settingsNavItem = {
  label: 'Settings',
  icon: Settings,
  permission: 'settings.manage',
};