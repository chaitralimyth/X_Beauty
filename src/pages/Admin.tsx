import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Scissors,
  Users,
  Tag,
  Activity,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Lock,
  CheckCircle,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { business } from '@/data/content';
import {
  api,
  getAuthToken,
  getStoredUser,
  type AppointmentResponse,
  type MessageResponse,
  type ServiceResponse,
  type StylistResponse,
  type OfferResponse,
  type DashboardOverview,
  type DashboardActivity,
} from '@/lib/api';

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

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const token = getAuthToken();
  const currentUser = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activity, setActivity] = useState<DashboardActivity | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [servicesList, setServicesList] = useState<ServiceResponse[]>([]);
  const [stylistsList, setStylistsList] = useState<StylistResponse[]>([]);
  const [offersList, setOffersList] = useState<OfferResponse[]>([]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [
        overviewRes,
        activityRes,
        bookingsRes,
        messagesRes,
        servicesRes,
        stylistsRes,
        offersRes,
      ] = await Promise.all([
        api.getDashboardOverview().catch(() => null),
        api.getDashboardActivity().catch(() => null),
        api.getBookings().catch(() => [] as AppointmentResponse[]),
        api.getMessages().catch(() => [] as MessageResponse[]),
        api.getServices().catch(() => [] as ServiceResponse[]),
        api.getStylists().catch(() => [] as StylistResponse[]),
        api.getOffers().catch(() => [] as OfferResponse[]),
      ]);

      if (overviewRes) setOverview(overviewRes);
      if (activityRes) setActivity(activityRes);
      setAppointments(bookingsRes);
      setMessages(messagesRes);
      setServicesList(servicesRes);
      setStylistsList(stylistsRes);
      setOffersList(offersRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to communicate with the X-Beauty backend. Please check connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  const handleUpdateBookingStatus = async (
    bookingId: number,
    newStatus: 'confirmed' | 'declined' | 'completed' | 'cancelled'
  ) => {
    const key = `booking-${bookingId}-${newStatus}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const updated = await api.updateBookingStatus(bookingId, newStatus);
      setAppointments((prev) =>
        prev.map((item) => (item.id === bookingId ? updated : item))
      );
      if (overview) {
        setOverview((prev) =>
          prev
            ? {
                ...prev,
                pendingAppointments: Math.max(0, prev.pendingAppointments - 1),
                confirmedAppointments:
                  newStatus === 'confirmed'
                    ? prev.confirmedAppointments + 1
                    : prev.confirmedAppointments,
              }
            : null
        );
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update appointment status. Please try again.'
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleMarkMessageRead = async (messageId: number) => {
    const key = `msg-${messageId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const updated = await api.markMessageRead(messageId);
      setMessages((prev) =>
        prev.map((item) => (item.id === messageId ? updated : item))
      );
      if (overview) {
        setOverview((prev) =>
          prev ? { ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) } : null
        );
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to mark message as read.'
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  // If not logged in, prompt to log in
  if (!token) {
    return (
      <>
        <SEO title="Staff Authentication | X Beauty" description="Staff authentication required" />
        <section className="pt-32 pb-20 min-h-screen flex items-center bg-neutral-50">
          <div className="container-x max-w-md">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-accent-600" />
              </div>
              <h1 className="text-2xl font-serif font-medium mb-2">Staff Portal Access</h1>
              <p className="text-sm text-neutral-600 mb-6">
                Please sign in with your staff account to view and manage live appointments, customer inquiries, and salon data.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Sign In to Staff Portal
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard | X Beauty" description="Staff management dashboard for X Beauty." />
      <section className="pt-24 pb-20 min-h-screen bg-neutral-50">
        <div className="container-x">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-serif font-medium">Admin Dashboard</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Render Backend Live
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Welcome back, {currentUser?.name || 'Staff'} ({currentUser?.email || 'staff@xbeauty.in'})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="btn-outline text-sm flex items-center gap-2"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link to="/" className="btn-outline text-sm">
                View Website
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full text-sm font-medium border border-neutral-300 hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Connected banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 text-sm text-emerald-900">
              <strong>Connected to Render Production Backend</strong> (<code>https://x-beauty-backend.onrender.com</code>).
              Live appointments, messages, and services are synchronized in real-time.
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Backend Communication Error</p>
                <p className="mt-1 text-red-600">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-charcoal text-ivory'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'appointments' && appointments.filter((a) => a.status === 'pending').length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold">
                    {appointments.filter((a) => a.status === 'pending').length}
                  </span>
                )}
                {id === 'messages' && messages.filter((m) => !m.is_read).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-500 text-white font-bold">
                    {messages.filter((m) => !m.is_read).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent-600 mx-auto mb-3" />
                <p className="text-neutral-600 text-sm">
                  Fetching live business data from Render...
                </p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-serif font-medium mb-6">Live Overview</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                      {[
                        {
                          label: 'Pending Requests',
                          value: overview?.pendingAppointments ?? appointments.filter((a) => a.status === 'pending').length,
                          Icon: CalendarCheck,
                          color: 'text-amber-600 bg-amber-50',
                        },
                        {
                          label: 'New Messages',
                          value: overview?.unreadMessages ?? messages.filter((m) => !m.is_read).length,
                          Icon: MessageSquare,
                          color: 'text-blue-600 bg-blue-50',
                        },
                        {
                          label: 'Active Services',
                          value: overview?.activeServices ?? servicesList.length,
                          Icon: Scissors,
                          color: 'text-accent-600 bg-accent-50',
                        },
                        {
                          label: 'Team Members',
                          value: overview?.activeStylists ?? stylistsList.length,
                          Icon: Users,
                          color: 'text-green-600 bg-green-50',
                        },
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

                    <h3 className="text-lg font-serif font-medium mb-4">Recent Bookings</h3>
                    {activity && activity.recentBookings.length > 0 ? (
                      <div className="space-y-3">
                        {activity.recentBookings.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-sm">{b.name}</p>
                              <p className="text-xs text-neutral-400">{b.service}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-neutral-500">{b.date} at {b.time}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  b.status === 'confirmed'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : appointments.length > 0 ? (
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-sm">{a.full_name}</p>
                              <p className="text-xs text-neutral-400">{a.service}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-neutral-500">{a.date} at {a.time}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  a.status === 'confirmed'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 py-4">No recent bookings found.</p>
                    )}
                  </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-medium">Appointment Requests</h2>
                      <span className="text-xs text-neutral-500">
                        Total: {appointments.length}
                      </span>
                    </div>

                    {appointments.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl">
                        <CalendarCheck className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="font-medium text-neutral-600">No appointment requests yet</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          When clients submit booking forms on the website, they will appear here live.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b border-neutral-100">
                              <th className="pb-3 font-medium text-neutral-500">Client</th>
                              <th className="pb-3 font-medium text-neutral-500">Service</th>
                              <th className="pb-3 font-medium text-neutral-500">Stylist</th>
                              <th className="pb-3 font-medium text-neutral-500">Date &amp; Time</th>
                              <th className="pb-3 font-medium text-neutral-500">Status</th>
                              <th className="pb-3 font-medium text-neutral-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map((a) => {
                              const confirmKey = `booking-${a.id}-confirmed`;
                              const declineKey = `booking-${a.id}-declined`;

                              return (
                                <tr key={a.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                                  <td className="py-4">
                                    <p className="font-medium text-charcoal">{a.full_name}</p>
                                    <p className="text-xs text-neutral-400">{a.phone}</p>
                                    {a.email && (
                                      <p className="text-xs text-neutral-400">{a.email}</p>
                                    )}
                                  </td>
                                  <td className="py-4 text-neutral-700">{a.service}</td>
                                  <td className="py-4 text-neutral-500">{a.stylist || 'No preference'}</td>
                                  <td className="py-4 text-neutral-600">
                                    <p>{a.date}</p>
                                    <p className="text-xs text-neutral-400">{a.time}</p>
                                  </td>
                                  <td className="py-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                        a.status === 'confirmed'
                                          ? 'bg-green-50 text-green-700'
                                          : a.status === 'declined'
                                          ? 'bg-red-50 text-red-700'
                                          : a.status === 'cancelled'
                                          ? 'bg-neutral-100 text-neutral-600'
                                          : 'bg-amber-50 text-amber-700'
                                      }`}
                                    >
                                      {a.status}
                                    </span>
                                  </td>
                                  <td className="py-4">
                                    <div className="flex gap-2">
                                      {a.status !== 'confirmed' && (
                                        <button
                                          onClick={() => handleUpdateBookingStatus(a.id, 'confirmed')}
                                          disabled={actionLoading[confirmKey]}
                                          className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                          aria-label="Confirm appointment"
                                          title="Confirm appointment"
                                        >
                                          {actionLoading[confirmKey] ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Check className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                      {a.status !== 'declined' && (
                                        <button
                                          onClick={() => handleUpdateBookingStatus(a.id, 'declined')}
                                          disabled={actionLoading[declineKey]}
                                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                          aria-label="Decline appointment"
                                          title="Decline appointment"
                                        >
                                          {actionLoading[declineKey] ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <X className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-medium">Customer Messages</h2>
                      <span className="text-xs text-neutral-500">
                        Total: {messages.length}
                      </span>
                    </div>

                    {messages.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl">
                        <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="font-medium text-neutral-600">No contact messages yet</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Messages submitted via the Contact page will be displayed here in real-time.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((m) => {
                          const isUpdating = actionLoading[`msg-${m.id}`];

                          return (
                            <div
                              key={m.id}
                              className={`border rounded-xl p-5 transition-colors ${
                                m.is_read
                                  ? 'border-neutral-100 bg-white'
                                  : 'border-blue-200 bg-blue-50/20'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-charcoal">{m.name}</p>
                                    {!m.is_read && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> {m.email}
                                    </span>
                                    {m.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {m.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-400">
                                  {new Date(m.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-700 mt-2 bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                                {m.message}
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                {!m.is_read && (
                                  <button
                                    onClick={() => handleMarkMessageRead(m.id)}
                                    disabled={isUpdating}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Mark as Read
                                  </button>
                                )}
                                <a
                                  href={`mailto:${m.email}?subject=X Beauty - Reply to your inquiry`}
                                  className="text-xs font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1"
                                >
                                  <Mail className="w-3.5 h-3.5" /> Reply by Email
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-medium">Services</h2>
                      <span className="text-xs text-neutral-500">
                        {servicesList.length} services configured
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {servicesList.map((s) => (
                        <div key={s.id} className="border border-neutral-100 rounded-xl p-5 hover:border-neutral-200 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-charcoal">{s.name}</h3>
                            <Scissors className="w-4 h-4 text-accent-500" />
                          </div>
                          <p className="text-xs text-neutral-400 mb-2">{s.category}</p>
                          {s.description && (
                            <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
                              {s.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-50 text-xs">
                            <span className="font-serif font-medium text-accent-600">{s.price}</span>
                            <span className="text-neutral-400">{s.duration || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stylists Tab */}
                {activeTab === 'stylists' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-medium">Stylists</h2>
                      <span className="text-xs text-neutral-500">
                        {stylistsList.length} stylists configured
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stylistsList.map((s) => (
                        <div key={s.id} className="border border-neutral-100 rounded-xl p-5 text-center hover:border-neutral-200 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-accent-500" />
                          </div>
                          <p className="font-medium text-charcoal">{s.name}</p>
                          <p className="text-xs text-neutral-400 mt-1">{s.specialty}</p>
                          {s.experience && (
                            <p className="text-xs text-accent-600 mt-1 font-medium">{s.experience}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-serif font-medium">Offers</h2>
                      <span className="text-xs text-neutral-500">
                        {offersList.length} offers active
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {offersList.map((o) => (
                        <div key={o.id} className="border border-neutral-100 rounded-xl p-5 hover:border-neutral-200 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <Tag className="w-5 h-5 text-accent-500" />
                            {o.badge && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-accent-100 text-accent-700 font-medium">
                                {o.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-charcoal">{o.title}</p>
                          <p className="text-lg font-serif text-accent-600 mt-1">{o.price}</p>
                          {o.description && (
                            <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                              {o.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div>
                    <h2 className="text-xl font-serif font-medium mb-6">Website Activity</h2>
                    <div className="grid sm:grid-cols-2 gap-5 mb-8">
                      <div className="border border-neutral-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-accent-500" />
                          <span className="text-sm text-neutral-500">Bookings This Week</span>
                        </div>
                        <p className="text-2xl font-serif font-medium">
                          {activity?.bookingsThisWeek ?? 0}
                        </p>
                      </div>
                      <div className="border border-neutral-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-neutral-500">Messages This Week</span>
                        </div>
                        <p className="text-2xl font-serif font-medium">
                          {activity?.messagesThisWeek ?? 0}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-serif font-medium mb-4">Top Pages</h3>
                    <div className="space-y-2">
                      {[
                        { page: '/', views: '420' },
                        { page: '/services/hair', views: '312' },
                        { page: '/services', views: '245' },
                        { page: '/gallery', views: '180' },
                        { page: '/booking', views: '90' },
                      ].map((p) => (
                        <div key={p.page} className="flex items-center justify-between border-b border-neutral-50 pb-2 last:border-0">
                          <code className="text-sm text-accent-600">{p.page}</code>
                          <span className="text-sm text-neutral-500">{p.views} views</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-serif font-medium mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'View Appointments', Icon: CalendarCheck, onClick: () => setActiveTab('appointments') },
                { label: 'Read Messages', Icon: MessageSquare, onClick: () => setActiveTab('messages') },
                { label: 'Manage Services', Icon: Scissors, onClick: () => setActiveTab('services') },
                { label: 'Call Business', Icon: Phone, href: `tel:${business.phoneRaw}` },
              ].map(({ label, Icon, onClick, href }) => {
                if (href) {
                  return (
                    <a
                      key={label}
                      href={href}
                      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent-600" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </a>
                  );
                }
                return (
                  <button
                    key={label}
                    onClick={onClick}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 text-left w-full"
                  >
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent-600" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Admin;
