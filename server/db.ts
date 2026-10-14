import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  Category,
  ContentItem,
  ContentAsset,
  ContentPlatformConfig,
  CalendarEntry,
  CampaignEvent,
  AnalyticsPlatform,
  AnalyticsPost,
  AdSpend,
  ChatbotFAQ,
  ChatbotLog,
  ActivityLog,
  SystemSettings,
  RawContentItem,
} from '../src/types/index.ts';

const DATA_FILE = path.resolve(process.cwd(), '.dummy_database.json');

export interface DatabaseState {
  profiles: UserProfile[];
  categories: Category[];
  content_items: ContentItem[];
  content_platforms: ContentPlatformConfig[];
  content_assets: ContentAsset[];
  calendar_entries: CalendarEntry[];
  campaign_events: CampaignEvent[];
  analytics_platform: AnalyticsPlatform[];
  analytics_posts: AnalyticsPost[];
  ad_spend: AdSpend[];
  chatbot_faq: ChatbotFAQ[];
  chatbot_logs: ChatbotLog[];
  activity_logs: ActivityLog[];
  settings: SystemSettings;
  raw_content: RawContentItem[];
}

export const getInitialData = (): DatabaseState => {
  const dateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };
  const dateStrOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const profiles: UserProfile[] = [
    {
      id: 'usr-001',
      full_name: 'Ustaz Hazwan Sabo',
      email: 'hazwansabo@gmail.com',
      role: 'owner',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: 'usr-002',
      full_name: 'Nurul Iman Farhana',
      email: 'nurul.marketing@alaminedu.com.my',
      role: 'marketing_staff',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 'usr-003',
      full_name: 'Ahmad Faiz Zulkifli',
      email: 'faiz.creative@alaminedu.com.my',
      role: 'marketing_staff',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: 'cat-001', name: 'Promotions', color: '#0E9F9A' },
    { id: 'cat-002', name: 'Educational', color: '#3B82F6' },
    { id: 'cat-003', name: 'Testimonials', color: '#8B5CF6' },
    { id: 'cat-004', name: 'Announcements', color: '#F59E0B' },
    { id: 'cat-005', name: 'Daily Tips', color: '#10B981' },
    { id: 'cat-006', name: 'Events & Workshops', color: '#EC4899' },
  ];

  const content_items: ContentItem[] = [
    {
      id: 'cnt-001',
      title: 'School Holiday Camp: Young Huffaz & AI Robotics 2026',
      message:
        'School holidays are just around the corner! Gift your children a transformative holiday experience combining modern visual Quran memorization and introductory AI Robotics at Al Amin Edu Oasis. 🌟\n\n🎯 Age Group: 7 - 14 years old\n📍 Venue: Main Campus, Bandar Baru Bangi\n🎁 Limited slots available for the first 30 early birds!',
      cta_text: 'Register Now & Enjoy 15% Discount',
      cta_url: 'https://alaminedu.com.my/huffaz-robotics-2026',
      format: 'carousel',
      status: 'scheduled',
      category_id: 'cat-001',
      tags: ['SchoolHolidays', 'YoungHuffaz', 'AIRobotics', 'BangiEdu'],
      created_by: 'usr-002',
      updated_by: 'usr-001',
      created_at: dateOffset(-5),
      updated_at: dateOffset(-2),
      times_scheduled: 2,
      last_used_at: dateOffset(1),
    },
    {
      id: 'cnt-002',
      title: '5 Easy Tips to Help Your Child Master Multiplication Without Rote Memorization',
      message:
        'Many parents struggle when it comes to helping children memorize multiplication tables. Try our proven visual math technique that boosts comprehension by 80% within two weeks! 💡\n\n1. Start with multiples of 2, 5, and 10\n2. Use LEGO blocks or tangible physical objects\n3. Practice rhythmic chant patterns\n4. Conduct 5-minute visual flashcard sessions\n5. Offer consistent encouragement for small milestones',
      cta_text: 'Download Free Math E-Book',
      cta_url: 'https://alaminedu.com.my/ebook-multiplication',
      format: 'carousel',
      status: 'published',
      category_id: 'cat-002',
      tags: ['ParentingTips', 'EasyMath', 'KidsEducation'],
      created_by: 'usr-002',
      updated_by: 'usr-002',
      created_at: dateOffset(-10),
      updated_at: dateOffset(-8),
      times_scheduled: 3,
      last_used_at: dateOffset(-3),
    },
    {
      id: 'cnt-003',
      title: 'New Student Intake 2027: Islamic Kindergarten & Integrated Primary School',
      message:
        'Official admissions for the 2027 Academic Year are now open! Al Amin Edu Oasis offers an integrated Cambridge & KSSR Tahfiz curriculum that nurtures well-rounded leaders with strong Quranic morals and academic excellence.\n\nAdmissions Assessment & Campus Open Day:\n🗓️ Every Saturday throughout November\nSeats are strictly capped per classroom quota!',
      cta_text: 'Submit Online Application Form',
      cta_url: 'https://alaminedu.com.my/admissions-2027',
      format: 'poster',
      status: 'scheduled',
      category_id: 'cat-004',
      tags: ['Intake2027', 'IslamicSchool', 'IntegratedTahfiz'],
      created_by: 'usr-001',
      updated_by: 'usr-001',
      created_at: dateOffset(-4),
      updated_at: dateOffset(-1),
      times_scheduled: 4,
      last_used_at: dateOffset(2),
    },
    {
      id: 'cnt-004',
      title: "Student Spotlight: How Harith Went from Shy to State Arabic Oratory Champion",
      message:
        '"Harith used to be very reserved and hesitant to speak in public. After joining the Leadership & Language Module at Al Amin Edu Oasis, his self-confidence skyrocketed, leading him to win 1st Place at the State Oratory Competition!" - Mrs. Mariam (Harith’s mother).\n\nWatch his inspiring journey in this full spotlight video.',
      cta_text: 'Watch Full Story on YouTube',
      cta_url: 'https://youtube.com/watch?v=alamin_harith_story',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'video',
      status: 'approved',
      category_id: 'cat-003',
      tags: ['ParentTestimonial', 'StudentSuccess', 'AlAminInspiration'],
      created_by: 'usr-003',
      updated_by: 'usr-001',
      created_at: dateOffset(-3),
      updated_at: dateOffset(-1),
      times_scheduled: 1,
      last_used_at: null,
    },
    {
      id: 'cnt-005',
      title: 'A Powerful Daily Prayer (Dua) for Children Facing Exams',
      message:
        'O Allah, open our children\'s hearts, grant them clarity of mind, and make every question easy for them to answer. Ameen ya Rabbal Alameen. 🤲✨\n\nSave and share this dua with your friends and family.',
      cta_text: 'Save & Share This Dua',
      cta_url: '',
      format: 'text',
      status: 'pending_approval',
      category_id: 'cat-005',
      tags: ['DailyDua', 'SpiritualTips', 'SchoolExams'],
      created_by: 'usr-002',
      updated_by: 'usr-002',
      created_at: dateOffset(-1),
      updated_at: dateOffset(-1),
      times_scheduled: 0,
      last_used_at: null,
    },
    {
      id: 'cnt-006',
      title: 'Parenting Webinar: Raising the Digital Generation with Quranic Values',
      message:
        'How do we guide children growing up in an era of mobile screens and social media algorithms? Join an exclusive session with the Founders of Al Amin Edu Oasis and leading Child Psychologists.\n\nFree admission via Zoom Live! Limited to 200 participants.',
      cta_text: 'Claim Free Zoom Pass',
      cta_url: 'https://alaminedu.com.my/webinar-parenting',
      format: 'poster',
      status: 'draft',
      category_id: 'cat-006',
      tags: ['FreeWebinar', 'DigitalParenting', 'HappyFamily'],
      created_by: 'usr-002',
      updated_by: 'usr-002',
      created_at: dateOffset(-2),
      updated_at: dateOffset(-2),
      times_scheduled: 0,
      last_used_at: null,
    },
  ];

  const content_platforms: ContentPlatformConfig[] = [
    { content_id: 'cnt-001', platform: 'facebook' },
    { content_id: 'cnt-001', platform: 'instagram' },
    { content_id: 'cnt-001', platform: 'tiktok', message_override: 'Kids bored during holidays? Join Al Amin Edu Oasis! Huffaz + AI Robotics. Link in bio!' },
    { content_id: 'cnt-002', platform: 'instagram' },
    { content_id: 'cnt-002', platform: 'threads', message_override: '5 quick tips to teach your child multiplication without stress. Bookmark this thread!' },
    { content_id: 'cnt-002', platform: 'facebook' },
    { content_id: 'cnt-003', platform: 'facebook' },
    { content_id: 'cnt-003', platform: 'instagram' },
    { content_id: 'cnt-003', platform: 'linkedin', message_override: 'Al Amin Edu Oasis opens 2027 admissions. Developing high-integrity future leaders.' },
    { content_id: 'cnt-003', platform: 'website' },
    { content_id: 'cnt-004', platform: 'instagram' },
    { content_id: 'cnt-004', platform: 'tiktok' },
    { content_id: 'cnt-005', platform: 'facebook' },
    { content_id: 'cnt-005', platform: 'threads' },
    { content_id: 'cnt-006', platform: 'facebook' },
  ];

  const content_assets: ContentAsset[] = [
    {
      id: 'ast-001',
      content_id: 'cnt-001',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      position: 1,
      alt_text: 'Slide 1 - Young Huffaz Program Introduction',
    },
    {
      id: 'ast-002',
      content_id: 'cnt-001',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      position: 2,
      alt_text: 'Slide 2 - AI Robotics Workshop Activities',
    },
    {
      id: 'ast-003',
      content_id: 'cnt-001',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
      position: 3,
      alt_text: 'Slide 3 - Daily Modules & Schedule',
    },
    {
      id: 'ast-004',
      content_id: 'cnt-001',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      position: 4,
      alt_text: 'Slide 4 - Fees & Registration Steps',
    },
    {
      id: 'ast-005',
      content_id: 'cnt-002',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
      position: 1,
      alt_text: 'Multiplication Mastery Tips Infographic',
    },
    {
      id: 'ast-006',
      content_id: 'cnt-003',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      position: 1,
      alt_text: '2027 Academic Year Admission Poster',
    },
    {
      id: 'ast-007',
      content_id: 'cnt-006',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      position: 1,
      alt_text: 'Positive Parenting Webinar Banner',
    },
  ];

  const calendar_entries: CalendarEntry[] = [
    {
      id: 'cal-001',
      content_id: 'cnt-002',
      platform: 'instagram',
      scheduled_at: dateOffset(-3),
      assigned_to: 'usr-002',
      status: 'published',
      published_url: 'https://instagram.com/p/alaminedu_tipsifir',
      notes: 'Published successfully at 10:00 AM. Parent engagement rate exceeded 9%.',
    },
    {
      id: 'cal-002',
      content_id: 'cnt-002',
      platform: 'facebook',
      scheduled_at: dateOffset(-3),
      assigned_to: 'usr-002',
      status: 'published',
      published_url: 'https://facebook.com/alaminedu/posts/102938481',
      notes: 'Cross-shared to 4 community parent groups in Bangi and Kajang.',
    },
    {
      id: 'cal-003',
      content_id: 'cnt-001',
      platform: 'instagram',
      scheduled_at: dateOffset(0), // Today
      assigned_to: 'usr-002',
      status: 'scheduled',
      notes: '4-slide carousel post. Ensure the bio registration link is active.',
    },
    {
      id: 'cal-004',
      content_id: 'cnt-001',
      platform: 'facebook',
      scheduled_at: dateOffset(0), // Today
      assigned_to: 'usr-002',
      status: 'scheduled',
      notes: 'Set as pinned post for the school holiday intake campaign.',
    },
    {
      id: 'cal-005',
      content_id: 'cnt-003',
      platform: 'facebook',
      scheduled_at: dateOffset(2),
      assigned_to: 'usr-001',
      status: 'scheduled',
      notes: 'Official launch of 2027 student admissions campaign.',
    },
    {
      id: 'cal-006',
      content_id: 'cnt-003',
      platform: 'instagram',
      scheduled_at: dateOffset(3),
      assigned_to: 'usr-002',
      status: 'scheduled',
      notes: 'Highlight campus labs, library, and sports facilities.',
    },
    {
      id: 'cal-007',
      content_id: 'cnt-001',
      platform: 'tiktok',
      scheduled_at: dateOffset(4),
      assigned_to: 'usr-003',
      status: 'scheduled',
      notes: 'Pair with trending educational audio for holiday camp promo.',
    },
    {
      id: 'cal-008',
      content_id: 'cnt-003',
      platform: 'linkedin',
      scheduled_at: dateOffset(6),
      assigned_to: 'usr-001',
      status: 'scheduled',
      notes: 'Emphasize academic leadership and Cambridge accreditation.',
    },
    {
      id: 'cal-009',
      content_id: 'cnt-002',
      platform: 'threads',
      scheduled_at: dateOffset(-1),
      assigned_to: 'usr-003',
      status: 'missed',
      notes: 'Missed optimal publishing window due to staff connection issue. Rescheduled.',
    },
  ];

  const campaign_events: CampaignEvent[] = [
    {
      id: 'cmp-001',
      title: '2027 Student Admissions Campaign',
      start_date: dateStrOffset(-7),
      end_date: dateStrOffset(21),
      color: '#0E9F9A',
    },
    {
      id: 'cmp-002',
      title: 'National Mid-Term School Holidays',
      start_date: dateStrOffset(1),
      end_date: dateStrOffset(10),
      color: '#F59E0B',
    },
    {
      id: 'cmp-003',
      title: 'Exclusive Young Huffaz & AI Robotics Workshop',
      start_date: dateStrOffset(3),
      end_date: dateStrOffset(6),
      color: '#EC4899',
    },
  ];

  const analytics_platform: AnalyticsPlatform[] = [
    {
      id: 'anl-001',
      platform: 'facebook',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 14850,
      followers_gained: 680,
      reach: 52400,
      impressions: 89300,
      likes: 3820,
      comments: 640,
      shares: 410,
      saves: 195,
      link_clicks: 1420,
      profile_visits: 2890,
      entered_by: 'usr-002',
      created_at: dateOffset(-1),
    },
    {
      id: 'anl-002',
      platform: 'instagram',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 22400,
      followers_gained: 1450,
      reach: 78900,
      impressions: 134200,
      likes: 6720,
      comments: 980,
      shares: 890,
      saves: 1340,
      link_clicks: 2850,
      profile_visits: 5120,
      entered_by: 'usr-002',
      created_at: dateOffset(-1),
    },
    {
      id: 'anl-003',
      platform: 'tiktok',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 18200,
      followers_gained: 2150,
      reach: 94000,
      impressions: 165000,
      likes: 11400,
      comments: 1420,
      shares: 1850,
      saves: 2100,
      link_clicks: 1980,
      profile_visits: 4300,
      entered_by: 'usr-002',
      created_at: dateOffset(-1),
    },
    {
      id: 'anl-004',
      platform: 'threads',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 4300,
      followers_gained: 340,
      reach: 12400,
      impressions: 21800,
      likes: 1250,
      comments: 310,
      shares: 140,
      saves: 280,
      link_clicks: 520,
      profile_visits: 980,
      entered_by: 'usr-002',
      created_at: dateOffset(-1),
    },
    {
      id: 'anl-005',
      platform: 'linkedin',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 3100,
      followers_gained: 180,
      reach: 8900,
      impressions: 15400,
      likes: 540,
      comments: 95,
      shares: 72,
      saves: 85,
      link_clicks: 410,
      profile_visits: 620,
      entered_by: 'usr-001',
      created_at: dateOffset(-1),
    },
    {
      id: 'anl-006',
      platform: 'website',
      period_start: dateStrOffset(-28),
      period_end: dateStrOffset(-1),
      followers: 0,
      followers_gained: 0,
      reach: 18500,
      impressions: 34000,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      link_clicks: 3400,
      profile_visits: 12400,
      entered_by: 'usr-001',
      created_at: dateOffset(-1),
    },
  ];

  const analytics_posts: AnalyticsPost[] = [
    {
      id: 'anlp-001',
      calendar_entry_id: 'cal-001',
      reach: 14200,
      impressions: 21500,
      likes: 1240,
      comments: 182,
      shares: 210,
      saves: 430,
      clicks: 340,
      video_views: 0,
      leads: 28,
      recorded_at: dateOffset(-1),
    },
    {
      id: 'anlp-002',
      calendar_entry_id: 'cal-002',
      reach: 8900,
      impressions: 14100,
      likes: 620,
      comments: 94,
      shares: 88,
      saves: 65,
      clicks: 180,
      video_views: 0,
      leads: 14,
      recorded_at: dateOffset(-1),
    },
  ];

  const ad_spend: AdSpend[] = [
    {
      id: 'ads-001',
      platform: 'facebook',
      period_start: dateStrOffset(-30),
      period_end: dateStrOffset(-1),
      amount_rm: 650,
      results: 54, // Enrollment leads
    },
    {
      id: 'ads-002',
      platform: 'instagram',
      period_start: dateStrOffset(-30),
      period_end: dateStrOffset(-1),
      amount_rm: 850,
      results: 82, // Enrollment leads
    },
    {
      id: 'ads-003',
      platform: 'tiktok',
      period_start: dateStrOffset(-30),
      period_end: dateStrOffset(-1),
      amount_rm: 400,
      results: 46, // Enrollment leads
    },
  ];

  const chatbot_faq: ChatbotFAQ[] = [
    {
      id: 'faq-001',
      question: 'What educational programs are offered at Al Amin Edu Oasis?',
      answer:
        'Al Amin Edu Oasis offers comprehensive integrated schooling: 1) Al Amin Islamic Kindergarten (ages 4-6), 2) Integrated Islamic Primary School (Cambridge & National KSSR with Quranic Tahfiz), 3) Young Huffaz Quranic Academy, and 4) School Holiday Workshops (AI Robotics, Arabic Immersion & Youth Leadership).',
      category: 'Programs & Curriculum',
      is_active: true,
    },
    {
      id: 'faq-002',
      question: 'What are the tuition and enrollment fees at Al Amin Edu Oasis?',
      answer:
        'Monthly tuition starts from RM280 for Islamic Kindergarten, RM450 for Primary School, and RM180 for afternoon Tahfiz enrichment classes. Annual registration including textbooks, educational kits, and uniforms is calculated separately per grade.',
      category: 'Fees & Payments',
      is_active: true,
    },
    {
      id: 'faq-003',
      question: 'How do I register a new student for admissions?',
      answer:
        'Admissions applications can be submitted online via our official portal at alaminedu.com.my or directly at our campus administration office. Once submitted, applicant students will be invited for a friendly diagnostic assessment and parent interview.',
      category: 'Admissions',
      is_active: true,
    },
    {
      id: 'faq-004',
      question: 'When does the next academic school term begin?',
      answer:
        'The upcoming 2027 academic school year will commence in early March 2027 in alignment with the Ministry of Education Malaysia (MOE) calendar. Student orientation and preparatory workshops take place two weeks prior to term opening.',
      category: 'Admissions',
      is_active: true,
    },
    {
      id: 'faq-005',
      question: 'Where is the campus located and are online classes available?',
      answer:
        'Our flagship campus is located in Bandar Baru Bangi, Selangor (near PKNS Complex). We also provide interactive online Quranic and academic enrichment classes via Zoom for students outside the Klang Valley.',
      category: 'Campus & Location',
      is_active: true,
    },
    {
      id: 'faq-006',
      question: 'How can I contact the administration team or schedule a campus tour?',
      answer:
        'You can reach our admissions counselors directly via WhatsApp at +6019-234 5678, email us at info@alaminedu.com.my, or visit our office Monday through Friday, 8:30 AM to 5:30 PM.',
      category: 'Contact & Support',
      is_active: true,
    },
    {
      id: 'faq-007',
      question: 'Are transit or after-school daycare facilities provided?',
      answer:
        'Yes, Al Amin Edu Oasis provides daycare and transit services until 6:30 PM daily, featuring supervised homework guidance, Quran revision, and balanced nutritious meals.',
      category: 'Campus & Location',
      is_active: true,
    },
  ];

  const chatbot_logs: ChatbotLog[] = [
    {
      id: 'log-001',
      session_id: 'ses-anon-8821',
      user_message: 'How much are kindergarten fees for a 5-year-old?',
      bot_reply:
        'Monthly tuition for Al Amin Islamic Kindergarten starts from RM280 per month. Please contact our admissions team on WhatsApp for transit package details.',
      answered_from_faq: true,
      created_at: dateOffset(-2),
    },
    {
      id: 'log-002',
      session_id: 'ses-anon-9943',
      user_message: 'Do you provide school van transportation to Kajang Utama?',
      bot_reply:
        'I apologize, but I do not have specific van route information in my knowledge base. Please contact our administrative office via WhatsApp at +6019-234 5678 for our transport operator list.',
      answered_from_faq: false,
      created_at: dateOffset(-1),
    },
  ];

  const activity_logs: ActivityLog[] = [
    {
      id: 'act-001',
      user_id: 'usr-001',
      user_name: 'Ustaz Hazwan Sabo',
      action: 'Owner Sign In',
      details: 'User authenticated into Al Amin Edu Oasis CMS control center.',
      created_at: dateOffset(0),
    },
    {
      id: 'act-002',
      user_id: 'usr-002',
      user_name: 'Nurul Iman Farhana',
      action: 'Create Content',
      details: 'Created content: "School Holiday Camp: Young Huffaz & AI Robotics 2026".',
      created_at: dateOffset(-5),
    },
    {
      id: 'act-003',
      user_id: 'usr-001',
      user_name: 'Ustaz Hazwan Sabo',
      action: 'Approve Content',
      details: 'Approved content "School Holiday Camp: Young Huffaz & AI Robotics 2026" for scheduling.',
      created_at: dateOffset(-2),
    },
    {
      id: 'act-004',
      user_id: 'usr-002',
      user_name: 'Nurul Iman Farhana',
      action: 'Update Calendar',
      details: 'Scheduled Instagram & Facebook holiday camp posts.',
      created_at: dateOffset(-1),
    },
  ];

  const settings: SystemSettings = {
    require_approval_before_scheduling: true,
    official_whatsapp: 'https://wa.me/60192345678',
    official_whatsapp_number: '+6019-234 5678',
    official_email: 'info@alaminedu.com.my',
    operating_hours: 'Monday - Friday, 8:30 AM - 5:30 PM',
    official_address: 'No 15, Jalan 9/2, Seksyen 9, 43650 Bandar Baru Bangi, Selangor, Malaysia',
    company_name: 'Al Amin Edu Oasis Sdn Bhd',
  };

  const raw_content: RawContentItem[] = [
    {
      id: 'raw-001',
      title: 'Hari Sukan Tahunan 2026: Drone B-Roll & Track Races (Google Drive)',
      link: 'https://drive.google.com/drive/folders/1AlAmin_SportsDay2026_RawFootage',
      category: 'Event Videos',
      tags: ['HariSukan', 'DroneFootage', 'SportsDay', 'TrackEvents'],
      file_type: 'drive',
      notes: 'High-res 4K drone footage + 600 unedited high-speed camera shots from the 100m sprint and tug of war. Ready for reels editor.',
      created_by: 'usr-002',
      created_at: dateOffset(-6),
    },
    {
      id: 'raw-002',
      title: 'Young Huffaz Ramadan Camp: Khatam & Memorization Audio/Video Takes',
      link: 'https://drive.google.com/drive/folders/1Huffaz_RamadanCamp_Recitations_Raw',
      category: 'Program Footage',
      tags: ['YoungHuffaz', 'QuranRecitation', 'Ramadan', 'UstazHazwan'],
      file_type: 'video',
      notes: 'Crisp Rode wireless lapel audio clips and multi-angle recordings of students reciting Surah Al-Mulk and Surah Ar-Rahman.',
      created_by: 'usr-001',
      created_at: dateOffset(-4),
    },
    {
      id: 'raw-003',
      title: 'Cambridge Science Lab Experiments & AI Robotics Building Session (Photos)',
      link: 'https://photos.app.goo.gl/AlAminRoboticsLab2026HighRes',
      category: 'Program Photos',
      tags: ['Robotics', 'ScienceLab', 'CambridgeCurriculum', 'STEM'],
      file_type: 'photo',
      notes: 'Over 200 candid photos of primary students assembling Arduino micro-controllers and chemical reaction demonstrations.',
      created_by: 'usr-003',
      created_at: dateOffset(-3),
    },
    {
      id: 'raw-004',
      title: 'Open Day 2026 Parent Experience Interviews & Campus Tour Clips',
      link: 'https://1drv.ms/f/s!AlAmin_ParentInterviews_OpenDay_Unedited',
      category: 'Raw Interviews',
      tags: ['Testimonials', 'ParentInterviews', 'CampusTour', 'Admissions2027'],
      file_type: 'drive',
      notes: '5 candid video interviews with prospective parents discussing their impression of the Islamic Cambridge hybrid system.',
      created_by: 'usr-002',
      created_at: dateOffset(-2),
    },
    {
      id: 'raw-005',
      title: 'Tadika Al Amin Little Scientist Graduation Rehearsal (Dropbox)',
      link: 'https://www.dropbox.com/sh/alamin_tadika_convocation_raw2026',
      category: 'Event Videos',
      tags: ['TadikaAlAmin', 'LittleScientist', 'Graduation', 'Preschool'],
      file_type: 'drive',
      notes: 'Stage performances, choral speaking, and nasyid presentations captured in 1080p60fps for end-of-year highlight montage.',
      created_by: 'usr-003',
      created_at: dateOffset(-1),
    },
  ];

  return {
    profiles,
    categories,
    content_items,
    content_platforms,
    content_assets,
    calendar_entries,
    campaign_events,
    analytics_platform,
    analytics_posts,
    ad_spend,
    chatbot_faq,
    chatbot_logs,
    activity_logs,
    settings,
    raw_content,
  };
};

class DummyDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadData();
  }

  private loadData(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.raw_content) {
          parsed.raw_content = getInitialData().raw_content;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load database from file, initializing fresh data:', e);
    }
    const fresh = getInitialData();
    this.saveData(fresh);
    return fresh;
  }

  private saveData(data?: DatabaseState): void {
    try {
      const stateToSave = data || this.state;
      fs.writeFileSync(DATA_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write dummy database file:', e);
    }
  }

  public resetToDefault(): DatabaseState {
    this.state = getInitialData();
    this.saveData();
    return this.state;
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return this.state.profiles;
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.state.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.state.profiles[idx] = { ...this.state.profiles[idx], ...updates };
    this.saveData();
    return this.state.profiles[idx];
  }

  public createProfile(profile: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
    const newProfile: UserProfile = {
      ...profile,
      id: `usr-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    this.state.profiles.push(newProfile);
    this.saveData();
    return newProfile;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.state.categories;
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now().toString().slice(-4)}`,
    };
    this.state.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.state.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.state.categories[idx] = { ...this.state.categories[idx], ...updates };
    this.saveData();
    return this.state.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    this.saveData();
    return this.state.categories.length < initialLen;
  }

  // --- Content Items & Joins ---
  public getContentItems(): ContentItem[] {
    const items = [...this.state.content_items];
    return items.map((item) => this.hydrateContentItem(item));
  }

  public getContentItemById(id: string): ContentItem | null {
    const item = this.state.content_items.find((c) => c.id === id);
    if (!item) return null;
    return this.hydrateContentItem(item);
  }

  private hydrateContentItem(item: ContentItem): ContentItem {
    const platforms = this.state.content_platforms.filter((cp) => cp.content_id === item.id);
    const assets = this.state.content_assets
      .filter((ca) => ca.content_id === item.id)
      .sort((a, b) => a.position - b.position);
    const category = this.state.categories.find((c) => c.id === item.category_id);
    const creator = this.state.profiles.find((p) => p.id === item.created_by);

    const calendarEntries = this.state.calendar_entries.filter((ce) => ce.content_id === item.id);
    const timesScheduled = calendarEntries.length;
    let lastUsedAt: string | null = null;
    if (calendarEntries.length > 0) {
      const dates = calendarEntries.map((ce) => new Date(ce.scheduled_at).getTime());
      lastUsedAt = new Date(Math.max(...dates)).toISOString();
    }

    return {
      ...item,
      platforms,
      assets,
      category,
      creator,
      times_scheduled: timesScheduled,
      last_used_at: lastUsedAt,
    };
  }

  public createContentItem(
    itemData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>,
    platformsData: { platform: any; message_override?: string }[],
    assetsData: { type: 'image' | 'video'; url: string; position: number; alt_text?: string }[]
  ): ContentItem {
    const id = `cnt-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      ...itemData,
      id,
      created_at: now,
      updated_at: now,
      times_scheduled: 0,
      last_used_at: null,
    };
    this.state.content_items.unshift(newItem);

    if (platformsData && platformsData.length > 0) {
      platformsData.forEach((p) => {
        this.state.content_platforms.push({
          content_id: id,
          platform: p.platform,
          message_override: p.message_override,
        });
      });
    }

    if (assetsData && assetsData.length > 0) {
      assetsData.forEach((a, idx) => {
        this.state.content_assets.push({
          id: `ast-${Date.now().toString().slice(-4)}-${idx}`,
          content_id: id,
          type: a.type,
          url: a.url,
          position: a.position || idx + 1,
          alt_text: a.alt_text || '',
        });
      });
    }

    this.saveData();
    return this.hydrateContentItem(newItem);
  }

  public updateContentItem(
    id: string,
    updates: Partial<ContentItem>,
    platformsData?: { platform: any; message_override?: string }[],
    assetsData?: { type: 'image' | 'video'; url: string; position: number; alt_text?: string }[]
  ): ContentItem | null {
    const idx = this.state.content_items.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.content_items[idx] = {
      ...this.state.content_items[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (platformsData) {
      this.state.content_platforms = this.state.content_platforms.filter((cp) => cp.content_id !== id);
      platformsData.forEach((p) => {
        this.state.content_platforms.push({
          content_id: id,
          platform: p.platform,
          message_override: p.message_override,
        });
      });
    }

    if (assetsData) {
      this.state.content_assets = this.state.content_assets.filter((ca) => ca.content_id !== id);
      assetsData.forEach((a, aIdx) => {
        this.state.content_assets.push({
          id: `ast-${Date.now().toString().slice(-4)}-${aIdx}`,
          content_id: id,
          type: a.type,
          url: a.url,
          position: a.position || aIdx + 1,
          alt_text: a.alt_text || '',
        });
      });
    }

    this.saveData();
    return this.hydrateContentItem(this.state.content_items[idx]);
  }

  public duplicateContentItem(id: string, user_id: string): ContentItem | null {
    const original = this.getContentItemById(id);
    if (!original) return null;

    const newTitle = `(Copy) ${original.title}`.slice(0, 150);
    const platforms = original.platforms?.map((p) => ({
      platform: p.platform,
      message_override: p.message_override,
    })) || [];
    const assets = original.assets?.map((a) => ({
      type: a.type,
      url: a.url,
      position: a.position,
      alt_text: a.alt_text,
    })) || [];

    return this.createContentItem(
      {
        title: newTitle,
        message: original.message,
        cta_text: original.cta_text,
        cta_url: original.cta_url,
        format: original.format,
        status: 'draft',
        category_id: original.category_id,
        tags: [...original.tags],
        video_url: original.video_url,
        created_by: user_id,
        updated_by: user_id,
      },
      platforms,
      assets
    );
  }

  public deleteContentItem(id: string): boolean {
    const initialLen = this.state.content_items.length;
    this.state.content_items = this.state.content_items.filter((c) => c.id !== id);
    this.state.content_platforms = this.state.content_platforms.filter((cp) => cp.content_id !== id);
    this.state.content_assets = this.state.content_assets.filter((ca) => ca.content_id !== id);
    this.state.calendar_entries = this.state.calendar_entries.filter((ce) => ce.content_id !== id);
    this.saveData();
    return this.state.content_items.length < initialLen;
  }

  // --- Calendar Entries ---
  public getCalendarEntries(): CalendarEntry[] {
    return this.state.calendar_entries.map((entry) => {
      const content = this.getContentItemById(entry.content_id) || undefined;
      const assignee = this.state.profiles.find((p) => p.id === entry.assigned_to);
      return {
        ...entry,
        content,
        assignee,
      };
    });
  }

  public createCalendarEntry(entry: Omit<CalendarEntry, 'id'>): CalendarEntry {
    const id = `cal-${Date.now().toString().slice(-4)}`;
    const newEntry: CalendarEntry = {
      ...entry,
      id,
    };
    this.state.calendar_entries.push(newEntry);

    const content = this.state.content_items.find((c) => c.id === entry.content_id);
    if (content && (content.status === 'draft' || content.status === 'approved')) {
      content.status = 'scheduled';
      content.updated_at = new Date().toISOString();
    }

    this.saveData();
    const hydContent = this.getContentItemById(entry.content_id) || undefined;
    const assignee = this.state.profiles.find((p) => p.id === entry.assigned_to);
    return { ...newEntry, content: hydContent, assignee };
  }

  public updateCalendarEntry(id: string, updates: Partial<CalendarEntry>): CalendarEntry | null {
    const idx = this.state.calendar_entries.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.calendar_entries[idx] = {
      ...this.state.calendar_entries[idx],
      ...updates,
    };

    if (updates.status === 'published') {
      const content = this.state.content_items.find((c) => c.id === this.state.calendar_entries[idx].content_id);
      if (content) {
        content.status = 'published';
        content.updated_at = new Date().toISOString();
      }
    }

    this.saveData();
    const hydContent = this.getContentItemById(this.state.calendar_entries[idx].content_id) || undefined;
    const assignee = this.state.profiles.find((p) => p.id === this.state.calendar_entries[idx].assigned_to);
    return { ...this.state.calendar_entries[idx], content: hydContent, assignee };
  }

  public deleteCalendarEntry(id: string): boolean {
    const initialLen = this.state.calendar_entries.length;
    this.state.calendar_entries = this.state.calendar_entries.filter((c) => c.id !== id);
    this.saveData();
    return this.state.calendar_entries.length < initialLen;
  }

  // --- Campaign Events ---
  public getCampaignEvents(): CampaignEvent[] {
    return this.state.campaign_events;
  }

  public createCampaignEvent(event: Omit<CampaignEvent, 'id'>): CampaignEvent {
    const newEvent: CampaignEvent = {
      ...event,
      id: `cmp-${Date.now().toString().slice(-4)}`,
    };
    this.state.campaign_events.push(newEvent);
    this.saveData();
    return newEvent;
  }

  public deleteCampaignEvent(id: string): boolean {
    const initialLen = this.state.campaign_events.length;
    this.state.campaign_events = this.state.campaign_events.filter((e) => e.id !== id);
    this.saveData();
    return this.state.campaign_events.length < initialLen;
  }

  // --- Analytics Platform & Posts & Ad Spend ---
  public getAnalyticsPlatform(): AnalyticsPlatform[] {
    return this.state.analytics_platform;
  }

  public createAnalyticsPlatform(data: Omit<AnalyticsPlatform, 'id'>): AnalyticsPlatform {
    const newAnl: AnalyticsPlatform = {
      ...data,
      id: `anl-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    this.state.analytics_platform.unshift(newAnl);
    this.saveData();
    return newAnl;
  }

  public getAnalyticsPosts(): AnalyticsPost[] {
    return this.state.analytics_posts;
  }

  public createAnalyticsPost(data: Omit<AnalyticsPost, 'id' | 'recorded_at'>): AnalyticsPost {
    const newPostAnl: AnalyticsPost = {
      ...data,
      id: `anlp-${Date.now().toString().slice(-4)}`,
      recorded_at: new Date().toISOString(),
    };
    this.state.analytics_posts.unshift(newPostAnl);
    this.saveData();
    return newPostAnl;
  }

  public getAdSpend(): AdSpend[] {
    return this.state.ad_spend;
  }

  public createAdSpend(data: Omit<AdSpend, 'id'>): AdSpend {
    const newAd: AdSpend = {
      ...data,
      id: `ads-${Date.now().toString().slice(-4)}`,
    };
    this.state.ad_spend.unshift(newAd);
    this.saveData();
    return newAd;
  }

  // --- Chatbot FAQ ---
  public getFAQs(): ChatbotFAQ[] {
    return this.state.chatbot_faq;
  }

  public getActiveFAQs(): ChatbotFAQ[] {
    return this.state.chatbot_faq.filter((f) => f.is_active);
  }

  public createFAQ(faq: Omit<ChatbotFAQ, 'id'>): ChatbotFAQ {
    const newFaq: ChatbotFAQ = {
      ...faq,
      id: `faq-${Date.now().toString().slice(-4)}`,
    };
    this.state.chatbot_faq.push(newFaq);
    this.saveData();
    return newFaq;
  }

  public updateFAQ(id: string, updates: Partial<ChatbotFAQ>): ChatbotFAQ | null {
    const idx = this.state.chatbot_faq.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.state.chatbot_faq[idx] = { ...this.state.chatbot_faq[idx], ...updates };
    this.saveData();
    return this.state.chatbot_faq[idx];
  }

  public deleteFAQ(id: string): boolean {
    const initialLen = this.state.chatbot_faq.length;
    this.state.chatbot_faq = this.state.chatbot_faq.filter((f) => f.id !== id);
    this.saveData();
    return this.state.chatbot_faq.length < initialLen;
  }

  // --- Chatbot Logs ---
  public getChatbotLogs(): ChatbotLog[] {
    return this.state.chatbot_logs;
  }

  public logChatbotQuery(
    sessionId: string,
    userMessage: string,
    botReply: string,
    answeredFromFAQ: boolean
  ): ChatbotLog {
    const log: ChatbotLog = {
      id: `log-${Date.now().toString().slice(-5)}`,
      session_id: sessionId,
      user_message: userMessage,
      bot_reply: botReply,
      answered_from_faq: answeredFromFAQ,
      created_at: new Date().toISOString(),
    };
    this.state.chatbot_logs.unshift(log);
    if (this.state.chatbot_logs.length > 200) {
      this.state.chatbot_logs = this.state.chatbot_logs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    return this.state.activity_logs;
  }

  public logActivity(userId: string, userName: string, action: string, details: string): ActivityLog {
    const log: ActivityLog = {
      id: `act-${Date.now().toString().slice(-5)}`,
      user_id: userId,
      user_name: userName,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    this.state.activity_logs.unshift(log);
    if (this.state.activity_logs.length > 200) {
      this.state.activity_logs = this.state.activity_logs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.saveData();
    return this.state.settings;
  }

  // --- Raw Content Vault ---
  public getRawContent(): RawContentItem[] {
    return this.state.raw_content || [];
  }

  public createRawContent(data: Omit<RawContentItem, 'id' | 'created_at'>): RawContentItem {
    const newItem: RawContentItem = {
      ...data,
      id: `raw-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
    };
    if (!this.state.raw_content) {
      this.state.raw_content = [];
    }
    this.state.raw_content.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateRawContent(id: string, updates: Partial<RawContentItem>): RawContentItem | null {
    if (!this.state.raw_content) return null;
    const idx = this.state.raw_content.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.state.raw_content[idx] = {
      ...this.state.raw_content[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.state.raw_content[idx];
  }

  public deleteRawContent(id: string): boolean {
    if (!this.state.raw_content) return false;
    const lenBefore = this.state.raw_content.length;
    this.state.raw_content = this.state.raw_content.filter((r) => r.id !== id);
    this.saveData();
    return this.state.raw_content.length < lenBefore;
  }
}

export const db = new DummyDatabase();
