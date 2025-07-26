import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Static sidebar data
    const sidebar = [
      {
        title: 'Dashboard',
        items: [
          { name: 'Overview', href: '/admin', icon: 'Home' },
          { name: 'Server Status', href: '/admin/server', icon: 'Server' },
          { name: 'Voice Studio', href: '/admin/voice', icon: 'Mic' },
          { name: 'AI Models', href: '/admin/models', icon: 'Database' },
        ]
      },
              {
          title: 'Management',
          items: [
            { name: 'Users', href: '/admin/users', icon: 'Users' },
            { name: 'Providers', href: '/admin/providers', icon: 'Server' },
            { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
            { name: 'Database', href: '/admin/database', icon: 'Database' },
          ]
        },
      {
        title: 'Productivity',
        items: [
          { name: 'Todo', href: '/admin/productivity/todo', icon: 'CheckSquare' },
          { name: 'Projects', href: '/admin/productivity/projects', icon: 'Folder' },
          { name: 'Scheduler', href: '/admin/productivity/scheduler', icon: 'Calendar' },
          { name: 'Notepad', href: '/admin/productivity/notepad', icon: 'FileText' },
          { name: 'Music', href: '/admin/productivity/music', icon: 'Music' },
          { name: 'Character', href: '/admin/productivity/character', icon: 'User' },
          { name: 'Correction', href: '/admin/productivity/correction', icon: 'Edit' },
          { name: 'Delivery', href: '/admin/productivity/delivery', icon: 'Truck' },
        ]
      },
      {
        title: 'Tools',
        items: [
          { name: 'Prompt Generator', href: '/admin/prompt-generator', icon: 'MessageSquare' },
          { name: 'AI Chat', href: '/ai-chat', icon: 'MessageCircle' },
        ]
      }
    ];

    return NextResponse.json({ success: true, data: sidebar });
  } catch (error) {
    console.error('Admin sidebar API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin sidebar' },
      { status: 500 }
    );
  }
} 