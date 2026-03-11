import { getDoubts, postDoubt } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { CheckCircleOutlined, EyeOutlined, MessageOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Empty, Input, message, Modal, Select, Spin, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const { TextArea } = Input;

const doubtSchema = z.object({
  title: z.string().trim().min(10, 'Title must be at least 10 characters').max(200, 'Title too long'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  subject: z.enum(['DSA', 'DBMS', 'OS', 'NETWORKS'] as const, { errorMap: () => ({ message: 'Subject is required' }) }),
  semester: z.number().min(1, 'Semester must be 1-8').max(8),
  labels: z.string().optional(),
});

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };
const doubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS'];

const DoubtCommunity = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [askModal, setAskModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ title: '', description: '', subject: '', semester: '', labels: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    return matchSearch && matchSubject;
  });

  const handleAsk = async () => {
    const result = doubtSchema.safeParse({ ...newDoubt, semester: Number(newDoubt.semester) || 0 });
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.errors.forEach((err) => { e[err.path[0] as string] = err.message; });
      setFormErrors(e);
      return;
    }

    try {
      setSubmitting(true);
      const labelsArray = newDoubt.labels ? newDoubt.labels.split(',').map(l => l.trim()).filter(Boolean) : [];
      await postDoubt({
        title: newDoubt.title,
        description: newDoubt.description,
        subject: newDoubt.subject as 'DSA' | 'DBMS' | 'OS' | 'NETWORKS',
        semester: Number(newDoubt.semester),
        labels: labelsArray,
      });
      message.success('Your doubt has been posted!');
      setNewDoubt({ title: '', description: '', subject: '', semester: '', labels: '' });
      setFormErrors({});
      setAskModal(false);
      fetchDoubts(); // Refresh the list
    } catch (error) {
      message.error('Failed to post doubt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const updateField = (field: string, value: string) => {
    setNewDoubt((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

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
  const resolvedDoubts = doubts.filter(d => d.status === 'RESOLVED').length;
  const totalViews = doubts.reduce((sum, d) => sum + d.views, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doubt Community</h1>
            <p className="text-muted-foreground">Ask, answer, and learn together.</p>
          </div>
          <button 
            onClick={() => setAskModal(true)}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-violet-700 transition-all cursor-pointer shadow-lg shadow-blue-500/30"
          >
            <PlusOutlined /> Ask a Doubt
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Doubts</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{doubts.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <QuestionCircleOutlined className="text-xl text-blue-500" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Open</p>
                <p className="text-2xl font-bold text-orange-500 tabular-nums">{openDoubts}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <MessageOutlined className="text-xl text-orange-500" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-500 tabular-nums">{resolvedDoubts}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircleOutlined className="text-xl text-green-500" />
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl bg-card border p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Views</p>
                <p className="text-2xl font-bold text-violet-500 tabular-nums">{totalViews}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <EyeOutlined className="text-xl text-violet-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input.Search placeholder="Search doubts..." className="max-w-xs placeholder-gray-800! placeholder:font-medium" onChange={(e) => setSearch(e.target.value)} allowClear />
          <Select placeholder="Filter by subject" className="min-w-35 [&_.ant-select-selection-placeholder]:text-gray-800! [&_.ant-select-selection-placeholder]:opacity-100 [&_.ant-select-selection-placeholder]:font-medium" allowClear onChange={(v) => setSubjectFilter(v || null)} options={doubtSubjects.map((s) => ({ label: s, value: s }))} />
        </div>

        {/* Doubt Cards */}
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
                transition={{ delay: i * 0.04 }} 
                whileHover={{ x: 3 }}
                className="bg-card rounded-2xl border p-5 cursor-pointer transition-all hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5" 
                onClick={() => navigate(`/student/doubts/${doubt.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base mb-1">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doubt.description}</p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      <Tag color="purple" className="rounded-full">{doubt.subject}</Tag>
                      <Tag className="rounded-full">Sem {doubt.semester}</Tag>
                      {doubt.labels?.map((label) => <Tag key={label} color="blue" className="rounded-full text-xs">{label}</Tag>)}
                    </div>
                  </div>
                  <Tag color={statusColors[doubt.status]} className="shrink-0">{doubt.status}</Tag>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <MessageOutlined className="text-blue-500 text-xs" />
                    </div>
                    {doubt.answerCount} answers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                      <EyeOutlined className="text-violet-500 text-xs" />
                    </div>
                    {doubt.views} views
                  </span>
                  <span className="hidden sm:block">by {doubt.postedBy.name || doubt.postedBy.username}</span>
                  <span className="hidden md:block">{formatDate(doubt.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ask Doubt Modal */}
        <Modal 
          open={askModal} 
          onCancel={() => { setAskModal(false); setFormErrors({}); }} 
          title={<span className="text-lg font-bold">Ask a Doubt</span>} 
          onOk={handleAsk} 
          okText="Post Doubt" 
          confirmLoading={submitting}
          width={600}
          className="modern-modal"
        >
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Question Title *</label>
              <Input 
                placeholder="What's your question? (min 10 chars)" 
                value={newDoubt.title} 
                onChange={(e) => updateField('title', e.target.value)} 
                status={formErrors.title ? 'error' : undefined} 
                maxLength={200}
                className="rounded-lg"
              />
              {formErrors.title && <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Description *</label>
              <TextArea 
                rows={5} 
                placeholder="Provide more details about your doubt (min 20 chars)..." 
                value={newDoubt.description} 
                onChange={(e) => updateField('description', e.target.value)} 
                status={formErrors.description ? 'error' : undefined} 
                maxLength={2000} 
                showCount
                className="rounded-lg"
              />
              {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Subject *</label>
                <Select 
                  placeholder="Select Subject" 
                  className="w-full" 
                  value={newDoubt.subject || undefined} 
                  onChange={(v) => updateField('subject', v)} 
                  options={doubtSubjects.map((s) => ({ label: s, value: s }))} 
                  status={formErrors.subject ? 'error' : undefined} 
                />
                {formErrors.subject && <p className="text-xs text-red-600 mt-1">{formErrors.subject}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Semester *</label>
                <Select 
                  placeholder="Semester" 
                  className="w-full" 
                  value={newDoubt.semester || undefined} 
                  onChange={(v) => updateField('semester', v)} 
                  options={[1,2,3,4,5,6,7,8].map((s) => ({ label: `Semester ${s}`, value: String(s) }))} 
                  status={formErrors.semester ? 'error' : undefined} 
                />
                {formErrors.semester && <p className="text-xs text-red-600 mt-1">{formErrors.semester}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Labels (optional)</label>
              <Input 
                placeholder="e.g. Sorting, Complexity, Searching" 
                value={newDoubt.labels} 
                onChange={(e) => updateField('labels', e.target.value)}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate multiple labels with commas</p>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default DoubtCommunity;