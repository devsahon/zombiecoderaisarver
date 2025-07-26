export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    models: "Models",
    aiTools: "AI Tools",
    serverMgmt: "Server Management",
    database: "Database",
    commands: "Commands",
    devTools: "Dev Tools",
    webhooks: "Webhooks",
    documentation: "Documentation",

    // Admin Panel
    adminPanel: "Admin Panel",
    aiManagement: "AI Management",
    administration: "Administration",
    publicAccess: "Public Access",
    language: "Language",
    systemStatus: "System Status",
    allSystemsOperational: "All Systems Operational",

    // Dashboard
    dashboardTitle: "AI Management Dashboard",
    dashboardDesc: "Monitor and manage your AI infrastructure",
    activeModels: "Active Models",
    totalRequests: "Total Requests",
    avgResponseTime: "Avg Response Time",
    connectedEditors: "Connected Editors",

    // Common
    settings: "Settings",
    publicDashboard: "Public Dashboard",
    aiChat: "AI Chat",
    setupGuide: "Setup Guide",
    troubleshooting: "Troubleshooting",
    analytics: "Analytics",
    users: "Users",
  },
  bn: {
    // Navigation
    dashboard: "ড্যাশবোর্ড",
    models: "মডেল",
    aiTools: "এআই টুলস",
    serverMgmt: "সার্ভার ব্যবস্থাপনা",
    database: "ডেটাবেস",
    commands: "কমান্ড",
    devTools: "ডেভ টুলস",
    webhooks: "ওয়েবহুক",
    documentation: "ডকুমেন্টেশন",

    // Admin Panel
    adminPanel: "অ্যাডমিন প্যানেল",
    aiManagement: "এআই ব্যবস্থাপনা",
    administration: "প্রশাসন",
    publicAccess: "পাবলিক অ্যাক্সেস",
    language: "ভাষা",
    systemStatus: "সিস্টেম স্ট্যাটাস",
    allSystemsOperational: "সব সিস্টেম চালু",

    // Dashboard
    dashboardTitle: "এআই ম্যানেজমেন্ট ড্যাশবোর্ড",
    dashboardDesc: "আপনার এআই অবকাঠামো পর্যবেক্ষণ এবং পরিচালনা করুন",
    activeModels: "সক্রিয় মডেল",
    totalRequests: "মোট অনুরোধ",
    avgResponseTime: "গড় প্রতিক্রিয়ার সময়",
    connectedEditors: "সংযুক্ত এডিটর",

    // Common
    settings: "সেটিংস",
    publicDashboard: "পাবলিক ড্যাশবোর্ড",
    aiChat: "এআই চ্যাট",
    setupGuide: "সেটআপ গাইড",
    troubleshooting: "সমস্যা সমাধান",
    analytics: "অ্যানালিটিক্স",
    users: "ব্যবহারকারী",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || translations.en[key] || key
}
