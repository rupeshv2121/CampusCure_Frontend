import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { getDoubts } from '@/api/faculty';
import { EyeOutlined, LikeOutlined, MessageOutlined, TrophyOutlined } from '@ant-design/icons';
import { Empty, Input, Select, Tag, message, Spin } from 'antd';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };
const doubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS'];

const FacultyDoubts = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const data = await getDoubts();
      setDoubts(data);
    } catch (error) {
      message.error('Failed to fetch doubts');
    } finally {
      setLoading(false);
    }
  };

  const filtered = doubts.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || d.subject === subjectFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchSubject && matchStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  // Calculate stats
  const openDoubts = doubts.filter(d => d.status === 'OPEN').length;
  const answeredDoubts = doubts.filter(d => d.status === 'ANSWERED').length;
  const resolvedDoubts = doubts.filter(d => d.status === 'RESOLVED').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doubt Management</h1>
            <p className="text-muted-foreground">Answer and verify student doubts.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Doubts</p>
                <p className="text-3xl font-bold text-orange-500 tabular-nums">{openDoubts}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <MessageOutlined className="text-2xl text-orange-500" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Answered</p>
                <p className="text-3xl font-bold text-blue-500 tabular-nums">{answeredDoubts}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <LikeOutlined className="text-2xl text-blue-500" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-500 tabular-nums">{resolvedDoubts}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <TrophyOutlined className="text-2xl text-green-500" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input.Search 
            placeholder="Search doubts..." 
            className="max-w-xs placeholder-gray-800! placeholder:font-medium" 
            onChange={(e) => setSearch(e.target.value)} 
            allowClear 
          />
          <Select 
            placeholder="Filter by subject" 
            className="min-w-35 [&_.ant-select-selection-placeholder]:text-gray-800! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" 
            allowClear 
            onChange={(v) => setSubjectFilter(v || null)} 
            options={doubtSubjects.map((s) => ({ label: s, value: s }))} 
          />
          <Select 
            placeholder="Filter by status" 
            className="min-w-35 [&_.ant-select-selection-placeholder]:text-gray-800! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" 
            allowClear 
            onChange={(v) => setStatusFilter(v || null)} 
            options={[
              { label: 'Open', value: 'OPEN' },
              { label: 'Answered', value: 'ANSWERED' },
              { label: 'Resolved', value: 'RESOLVED' },
            ]} 
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <Empty description="No doubts found" />}
            {filtered.map((doubt, i) => (
              <motion.div 
                key={doubt.id} 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.06 }} 
                whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(22,119,255,0.08)' }} 
                className="bg-card rounded-2xl border p-5 cursor-pointer transition" 
                onClick={() => navigate(`/faculty/doubts/${doubt.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doubt.description}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Tag color="purple">{doubt.subject}</Tag>
                      <Tag>Sem {doubt.semester}</Tag>
                      {doubt.labels?.map((label) => (
                        <Tag key={label} color="blue" className="rounded-full text-xs">{label}</Tag>
                      ))}
                    </div>
                  </div>
                  <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageOutlined /> {doubt.answerCount} answers
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeOutlined /> {doubt.views} views
                  </span>
                  <span>by {doubt.postedBy.name || doubt.postedBy.username}</span>
                  <span>{formatDate(doubt.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default FacultyDoubts;