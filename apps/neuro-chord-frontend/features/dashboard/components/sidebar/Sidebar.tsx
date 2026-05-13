'use client';

import { UserRole } from '@/features/onboarding/types';
import { neuroapi, useGetProfileQuery, useLogoutMutation } from '@/services/api';
import { useAppDispatch } from '@/store';
import { removeCredentials } from '@/store/slices/authSlice';
import { Avatar, Button, toast } from '@heroui/react';
import {
  BookOpen,
  ChevronLeft,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
}

/* =========================================================
   NAV CONFIG
   Role-specific groups. Swap/add/remove items here freely.
   ========================================================= */

const SHARED_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Messages', href: '/messages', icon: MessageSquare },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

const STUDENT_NAV: NavGroup[] = [
  {
    title: 'Learn',
    items: [
      { label: 'My Materials', href: '/dashboard/materials', icon: BookOpen },
      { label: 'Saved', href: '/dashboard/saved', icon: Star },
      { label: 'My Teachers', href: '/dashboard/teachers', icon: GraduationCap },
    ],
  },
];

const TEACHER_NAV: NavGroup[] = [
  {
    title: 'Manage',
    items: [
      { label: 'Materials', href: '/dashboard/materials', icon: FolderOpen },
      { label: 'My Students', href: '/dashboard/students', icon: Users },
      { label: 'Courses', href: '/courses', icon: BookOpen },
    ],
  },
];
const TEACHER_PENDING_NAV: NavGroup[] = [
  {
    title: 'Pending Approval',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', href: '/settings/profile', icon: Settings },
    ],
  },
];

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  [UserRole.Student]: [...SHARED_NAV, ...STUDENT_NAV],
  [UserRole.Teacher]: [...SHARED_NAV, ...TEACHER_NAV],
  [UserRole.TeacherPending]: [...SHARED_NAV, ...TEACHER_PENDING_NAV],
};

/* =========================================================
   SUB-COMPONENTS
   ========================================================= */

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group/link"
      style={{
        background: isActive ? 'var(--nav-item-bg-active)' : 'transparent',
        color: isActive ? 'var(--nav-item-text-active)' : 'var(--nav-item-text)',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-hover-overlay)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: 'var(--color-primary)' }}
        />
      )}

      <Icon
        size={17}
        strokeWidth={isActive ? 2.5 : 2}
        style={{ color: isActive ? 'var(--nav-item-text-active)' : 'var(--color-text-muted)', flexShrink: 0 }}
      />

      {!collapsed && <span className="truncate">{item.label}</span>}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span
          className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none
                     opacity-0 group-hover/link:opacity-100 transition-opacity z-50"
          style={{
            background: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function NavGroup({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      {group.title && !collapsed && (
        <p
          className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-placeholder)' }}
        >
          {group.title}
        </p>
      )}
      {group.items.map((item) => (
        <NavLink key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const groups = NAV_BY_ROLE[role];
  const [logout] = useLogoutMutation();
  const { data: profile } = useGetProfileQuery();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const displayName = profile?.displayName || 'User';
  const avatarUrl = profile?.imgUrl || null;
  //   if (!role) return null;
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Backend logout failed', err);
    }
    dispatch(removeCredentials());
    dispatch(neuroapi.util.resetApiState());
    toast.success('Logged out successfully');
    router.push('/sign-in');
  };
  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? '68px' : '224px',
        background: 'var(--nav-bg)',
        borderRight: '1px solid var(--nav-border)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── LOGO ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-5 shrink-0"
        style={{ borderBottom: '1px solid var(--nav-border)' }}
      >
        {/* Icon mark */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 2L3 5.5V10.5L8 14L13 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="1.75" fill="white" />
          </svg>
        </div>

        {!collapsed && (
          <span className="font-bold text-sm tracking-tight truncate" style={{ color: 'var(--color-text)' }}>
            Neuro <span style={{ color: 'var(--color-primary)' }}>Chord</span>
          </span>
        )}
      </div>

      {/* ── NAV GROUPS ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col gap-6">
        {groups?.map((group, i) => (
          <NavGroup key={i} group={group} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── ROLE BADGE ───────────────────────────────────── */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background:
                role === UserRole.Teacher ? 'oklch(from var(--teal-500) l c h / 0.1)' : 'var(--color-primary-subtle)',
              color: role === UserRole.Teacher ? 'var(--teal-600)' : 'var(--color-primary)',
            }}
          >
            {role === UserRole.Teacher ? (
              <GraduationCap size={11} strokeWidth={2.5} />
            ) : (
              <BookOpen size={11} strokeWidth={2.5} />
            )}
            {role}
          </span>
        </div>
      )}

      {/* ── USER FOOTER ──────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-3 py-3 mx-3 mb-3 rounded-xl"
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* src={avatarUrl} */}
        {avatarUrl ? (
          <Avatar
            alt={displayName}
            className="shrink-0 w-8 h-8 rounded-full object-cover"
            style={{ border: '2px solid var(--avatar-border)' }}
          />
        ) : (
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--avatar-bg)', color: 'var(--avatar-text)' }}
          >
            {initials}
          </div>
        )}
        {!collapsed && (
          <>
            <span className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {displayName}
            </span>

            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="Sign out"
              className="shrink-0 w-7 h-7 min-w-0 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
              onPress={() => {
                handleLogout();
              }}
            >
              <LogOut size={14} />
            </Button>
          </>
        )}
      </div>

      {/* ── COLLAPSE TOGGLE ──────────────────────────────── */}
      <Button
        onClick={() => setCollapsed((p) => !p)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center
                   transition-colors z-10"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)';
          (e.currentTarget as HTMLElement).style.color = 'white';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
        }}
      >
        <ChevronLeft
          size={12}
          strokeWidth={2.5}
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms' }}
        />
      </Button>
    </aside>
  );
}
