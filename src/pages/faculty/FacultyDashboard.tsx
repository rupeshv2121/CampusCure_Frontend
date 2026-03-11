import { assignedComplaints as getAssignedComplaints } from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Complaint, Doubt } from '@/types';
import { ArrowRightOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, FileTextOutlined, MessageOutlined, QuestionCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Progress, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CountUp = ({ end, delay = 0 }: { end: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = end / 72;
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 1000 / 60);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [end, delay]);
  return <>{count}</>;
};

const statusColors: Record<string, string> = { RAISED: 'orange', ASSIGNED: 'cyan', IN_PROGRESS: 'blue', RESOLVED: 'green', CLOSED: 'default' };

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignedComplaintsData, setAssignedComplaintsData] = useState<Complaint[]>([]);  
  // TODO: Fetch from backend API - Currently using empty array until doubts endpoint is implemented
  const unresolvedDoubts: Doubt[] = [];
  
  const resolvedCount = assignedComplaintsData.filter((c) => c.status === 'RESOLVED').length;
  const resolveRate = assignedComplaintsData.length > 0 ? Math.round((resolvedCount / assignedComplaintsData.length) * 100) : 0;

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  const stats = [
    { 
      label: 'Assigned Complaints', 
      value: assignedComplaintsData.length, 
      icon: <FileTextOutlined />, 
      from: 'from-blue-500', 
      to: 'to-blue-600', 
      shadow: 'shadow-blue-500/30', 
      ring: 'ring-blue-500/20' 
    },
    { 
      label: 'Resolved', 
      value: resolvedCount, 
      icon: <CheckCircleOutlined />, 
      from: 'from-green-500', 
      to: 'to-emerald-600', 
      shadow: 'shadow-green-500/30', 
      ring: 'ring-green-500/20' 
    },
    { 
      label: 'Pending Doubts', 
      value: unresolvedDoubts.length, 
      icon: <QuestionCircleOutlined />, 
      from: 'from-orange-500', 
      to: 'to-amber-600', 
      shadow: 'shadow-orange-500/30', 
      ring: 'ring-orange-500/20' 
    },
    { 
      label: 'Verified Answers', 
      value: 0, 
      icon: <SafetyCertificateOutlined />, 
      from: 'from-violet-500', 
      to: 'to-purple-600', 
      shadow: 'shadow-violet-500/30', 
      ring: 'ring-violet-500/20' 
    },
  ];

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      try {
        const data = await getAssignedComplaints();
        setAssignedComplaintsData(data);
      } catch (e: unknown) {
        console.error("Error fetching assigned complaints:", e);
        // message.error(e instanceof Error ? e.message : 'Failed to fetch assigned complaints'); --- IGNORE ---
      }
    };

    fetchAssignedComplaints();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ── 1. Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl"
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />
          {/* Glows */}
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-8 right-1/3 h-40 w-40 rounded-full bg-violet-600/15 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Avatar + info */}
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/40 ring-2 ring-white/20">
                {initials}
              </div>
              <div>
                <p className="text-blue-200/70 text-sm font-medium tracking-wide">Welcome back 👋</p>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-blue-100 ring-1 ring-white/10">
                    Faculty Member
                  </span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 sm:shrink-0">
              <button
                onClick={() => navigate('/faculty/complaints')}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FileTextOutlined /> View Complaints
              </button>
              <button
                onClick={() => navigate('/faculty/doubts')}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer shadow-lg shadow-blue-900/20"
              >
                <QuestionCircleOutlined /> Answer Doubts
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── 2. Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl bg-card border p-5 shadow-sm cursor-default overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${stat.from} ${stat.to} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
              <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${stat.from} ${stat.to} text-white text-base shadow-md ${stat.shadow} ring-4 ${stat.ring}`}>
                {stat.icon}
              </div>
              <div className="relative mt-4">
                <div className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                  <CountUp end={stat.value} delay={0.2 + i * 0.07} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── 3. Middle Row: Resolution | Assigned Complaints ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Resolution Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="rounded-2xl bg-card border p-6 shadow-sm flex flex-col items-center justify-center"
          >
            {assignedComplaintsData.length > 0 ? (
              <>
                <Progress
                  type="dashboard"
                  percent={resolveRate}
                  strokeColor={{ '0%': '#13c2c2', '100%': '#52c41a' }}
                  format={(p) => <span className="text-2xl font-bold text-foreground">{p}%</span>}
                  size={140}
                />
                <p className="text-sm font-medium text-foreground mt-3">Complaint Resolution</p>
                <p className="text-xs text-muted-foreground">{resolvedCount} of {assignedComplaintsData.length} resolved</p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-3">📊</div>
                <p className="text-sm font-medium text-foreground">No Complaints Assigned</p>
                <p className="text-xs text-muted-foreground mt-1">Resolution rate will appear once complaints are assigned</p>
              </div>
            )}
          </motion.div>

          {/* Assigned Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.43 }}
            className="rounded-2xl bg-card border p-6 shadow-sm lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="inline-flex h-5 w-5 rounded-md bg-linear-to-br from-blue-500 to-violet-600 items-center justify-center text-white text-[10px] font-bold">
                  <ClockCircleOutlined />
                </span>
                Assigned Complaints
              </h3>
              {assignedComplaintsData.length > 0 && (
                <button 
                  onClick={() => navigate('/faculty/complaints')} 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View All <ArrowRightOutlined />
                </button>
              )}
            </div>
            {assignedComplaintsData.length > 0 ? (
              <div className="space-y-2.5">
                {assignedComplaintsData.slice(0, 4).map((c, i) => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border hover:border-blue-500/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate('/faculty/complaints')}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Room {c.classroomNumber} · Block {c.block}
                      </p>
                    </div>
                    <Tag color={statusColors[c.status]}>{c.status.replace('_', ' ')}</Tag>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📋</div>
                <p className="text-sm font-medium text-foreground">No Complaints Assigned Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your assigned complaints will appear here</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── 4. Recent Doubts ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="inline-flex h-5 w-5 rounded-md bg-linear-to-br from-violet-500 to-purple-600 items-center justify-center text-white text-[10px] font-bold">
                <BookOutlined />
              </span>
              Recent Doubts
            </h3>
            {unresolvedDoubts.length > 0 && (
              <button 
                onClick={() => navigate('/faculty/doubts')} 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                View All <ArrowRightOutlined />
              </button>
            )}
          </div>
          {unresolvedDoubts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {unresolvedDoubts.slice(0, 3).map((d, i) => (
                <motion.div 
                  key={d.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="p-4 rounded-xl border bg-muted/5 hover:border-blue-500/30 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate('/faculty/doubts')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color="purple" className="text-xs">{d.subject}</Tag>
                    <Tag color={d.status === 'ANSWERED' ? 'blue' : 'orange'} className="text-xs">{d.status}</Tag>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{d.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageOutlined /> {d.answerCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeOutlined /> {d.views}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-3">❓</div>
              <p className="text-sm font-medium text-foreground">No Doubts Posted Yet</p>
              <p className="text-xs text-muted-foreground mt-1">Student doubts will appear here for you to answer</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboard;