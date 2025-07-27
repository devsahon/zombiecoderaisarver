import { NextResponse } from 'next/server';

export async function GET() {
  const sidebarItems = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Overview', href: '/admin', icon: 'Home' },
        { name: 'Server Status', href: '/admin/server', icon: 'Server' },
        { name: 'Voice Studio', href: '/admin/voice', icon: 'Mic' },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Providers', href: '/admin/providers', icon: 'Settings' },
        { name: 'Image Generation', href: '/admin/image-generation', icon: 'Image' },
        { name: 'Video Generation', href: '/admin/video-generation', icon: 'Video' },
        { name: 'Communications', href: '/admin/communications', icon: 'Mail' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Usage Stats', href: '/admin/analytics', icon: 'BarChart' },
        { name: 'System Logs', href: '/admin/logs', icon: 'FileText' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'System Config', href: '/admin/settings', icon: 'Settings' },
        { name: 'User Management', href: '/admin/users', icon: 'Users' },
      ]
    }
  ];

  return NextResponse.json({ success: true, data: sidebarItems });
} 