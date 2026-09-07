import { useState } from 'react';
import {
  LayoutDashboard, CalendarCheck, MessageSquare, Scissors, Users, Tag,
  Activity, Plus, Eye, Check, X, Clock, Phone, Mail,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { business } from '@/data/content';

type Tab = 'overview' | 'appointments' | 'messages' | 'services' | 'stylists' | 'offers' | 'activity';

const tabs: { id: Tab; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointment Requests', Icon: CalendarCheck },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
  { id: 'services', label: 'Services', Icon: Scissors },
  { id: 'stylists', label: 'Stylists', Icon: Users },
  { id: 'offers', label: 'Offers', Icon: Tag },
  { id: 'activity', label: 'Website Activity', Icon: Activity },
];

const sampleAppointments = [
  { id: 1, name: 'Priya Sharma', phone: '+91 98XXX XXX12', service: 'Hair — Balayage', date: '2026-09-08', time: '11:00', status: 'pending' },
  { id: 2, name: 'Karan Mehta', phone: '+91 98XXX XXX45', service: 'Grooming — Men\'s Grooming', date: '2026-09-08', time: '14:30', status: 'pending' },
  { id: 3, name: 'Sneha Reddy', phone: '+91 98XXX XXX78', service: 'Treatments — Keratin', date: '2026-09-09', time: '10:00', status: 'confirmed' },
  { id: 4, name: 'Aditya Kumar', phone: '+91 98XXX XXX90', service: 'Hair — Men\'s Haircut', date: '2026-09-09', time: '16:00', status: 'pending' },
];

const sampleMessages = [
  { id: 1, name: 'Fatima A.', email: 'fatima@example.com', phone: '+91 98XXX XX11', message: 'Do you offer hair smoothening for frizzy hair? What are the charges?', date: '2026-09-06' },
  { id: 2, name: 'Rahul D.', email: 'rahul@example.com', phone: '', message: 'Is the Fresh Look Package available on weekends?', date: '2026-09-05' },
  { id: 3, name: 'Anjali P.', email: 'anjali@example.com', phone: '+91 98XXX XX22', message: 'Can I book a colour consultation before committing to global colour?', date: '2026-09-04' },
];

const sampleActivity = [
  { label: 'Page Views (Today)', value: '1,247', change: '+12%' },
  { label: 'Booking Requests (This Week)', value: '38', change: '+8%' },
  { label: 'Contact Messages (This Week)', value: '14', change: '+5%' },
  { label: 'Most Visited Page', value: '/services/hair', change: '' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <>
      <SEO title="Admin Dashboard | X Beauty" description="Staff management dashboard for X Beauty." />
      <section className="pt-24 pb-20 min-h-screen bg-neutral-50">
        <div className="container-x">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-medium">Admin Dashboard</h1>
              <p className="text-sm text-neutral-500 mt-1">Welcome back, Staff</p>
            </div>
            <div className="flex gap-3">
              <button className="btn-outline text-sm">
                <Plus className="w-4 h-4" />
                Quick Action
              </button>
              <a href="/" className="btn-primary text-sm">View Website</a>
            </div>
          </div>

          {/* Demo notice */}
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-accent-600" />
            </div>
            <p className="text-sm text-accent-800">
              <strong>Demo dashboard</strong> — connect to a backend to enable live business management. All data shown below is sample/demo data.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-charcoal text-ivory'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Overview</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {[
                    { label: 'Pending Requests', value: '3', Icon: CalendarCheck, color: 'text-amber-600 bg-amber-50' },
                    { label: 'New Messages', value: '5', Icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Active Services', value: '31', Icon: Scissors, color: 'text-accent-600 bg-accent-50' },
                    { label: 'Team Members', value: '4', Icon: Users, color: 'text-green-600 bg-green-50' },
                  ].map(({ label, value, Icon, color }) => (
                    <div key={label} className="border border-neutral-100 rounded-xl p-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-serif font-medium">{value}</p>
                      <p className="text-sm text-neutral-500">{label}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-lg font-serif font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {sampleActivity.map((a) => (
                    <div key={a.label} className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-0">
                      <span className="text-sm text-neutral-600">{a.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{a.value}</span>
                        {a.change && <span className="text-xs text-green-600">{a.change}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Appointment Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-neutral-100">
                        <th className="pb-3 font-medium text-neutral-500">Name</th>
                        <th className="pb-3 font-medium text-neutral-500">Service</th>
                        <th className="pb-3 font-medium text-neutral-500">Date &amp; Time</th>
                        <th className="pb-3 font-medium text-neutral-500">Status</th>
                        <th className="pb-3 font-medium text-neutral-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleAppointments.map((a) => (
                        <tr key={a.id} className="border-b border-neutral-50 last:border-0">
                          <td className="py-4">
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-neutral-400">{a.phone}</p>
                          </td>
                          <td className="py-4 text-neutral-600">{a.service}</td>
                          <td className="py-4 text-neutral-600">
                            <p>{a.date}</p>
                            <p className="text-xs text-neutral-400">{a.time}</p>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              a.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {a.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center" aria-label="Confirm">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center" aria-label="Decline">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Messages</h2>
                <div className="space-y-4">
                  {sampleMessages.map((m) => (
                    <div key={m.id} className="border border-neutral-100 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <div className="flex gap-4 text-xs text-neutral-400 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>
                            {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-neutral-400">{m.date}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-2">{m.message}</p>
                      <button className="text-sm text-accent-600 hover:text-accent-700 mt-3 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Reply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Services</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Hair', 'Grooming', 'Hair Colour', 'Hair Treatments', 'Skin & Beauty'].map((s) => (
                    <div key={s} className="border border-neutral-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{s}</h3>
                        <Scissors className="w-4 h-4 text-accent-500" />
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">5–7 items</p>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-full bg-cream text-neutral-600 hover:bg-neutral-200 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-full bg-cream text-neutral-600 hover:bg-neutral-200 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stylists' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Stylists</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Aarav', role: 'Senior Hair Stylist' },
                    { name: 'Meera', role: 'Hair & Colour Specialist' },
                    { name: 'Rohan', role: 'Grooming Specialist' },
                    { name: 'Anaya', role: 'Beauty & Skin Specialist' },
                  ].map((s) => (
                    <div key={s.name} className="border border-neutral-100 rounded-xl p-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-accent-500" />
                      </div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-neutral-400 mt-1">{s.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Offers</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Fresh Look Package', price: '₹699' },
                    { title: 'Grooming Combo', price: '₹499' },
                    { title: 'Glow Package', price: '₹1,299' },
                    { title: 'Colour Consultation', price: 'Free' },
                  ].map((o) => (
                    <div key={o.title} className="border border-neutral-100 rounded-xl p-5">
                      <Tag className="w-5 h-5 text-accent-500 mb-2" />
                      <p className="font-medium">{o.title}</p>
                      <p className="text-lg font-serif text-accent-600 mt-1">{o.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-serif font-medium mb-6">Website Activity</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {sampleActivity.map((a) => (
                    <div key={a.label} className="border border-neutral-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-accent-500" />
                        <span className="text-sm text-neutral-500">{a.label}</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-serif font-medium">{a.value}</span>
                        {a.change && <span className="text-sm text-green-600">{a.change}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-serif font-medium mb-4">Top Pages</h3>
                  <div className="space-y-2">
                    {[
                      { page: '/', views: 420 },
                      { page: '/services/hair', views: 312 },
                      { page: '/services', views: 245 },
                      { page: '/gallery', views: 180 },
                      { page: '/booking', views: 90 },
                    ].map((p) => (
                      <div key={p.page} className="flex items-center justify-between border-b border-neutral-50 pb-2 last:border-0">
                        <code className="text-sm text-accent-600">{p.page}</code>
                        <span className="text-sm text-neutral-500">{p.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-serif font-medium mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'View Appointments', Icon: CalendarCheck, href: '#' },
                { label: 'Read Messages', Icon: MessageSquare, href: '#' },
                { label: 'Manage Services', Icon: Scissors, href: '#' },
                { label: 'Call Business', Icon: Phone, href: `tel:${business.phoneRaw}` },
              ].map(({ label, Icon, href }) => (
                <a key={label} href={href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent-600" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Admin;
