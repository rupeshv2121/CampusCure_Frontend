import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { getDoubtById, postAnswer, verifyAnswer, editAnswer, deleteAnswer } from '@/api/faculty';
import {
  EyeOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Avatar, Empty, Input, message, Modal, Spin, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const { TextArea } = Input;

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };

const FacultyDoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState('');

  useEffect(() => {
    if (id) {
      fetchDoubt();
    }
  }, [id]);

  const fetchDoubt = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getDoubtById(id);
      setDoubt(data);
    } catch (error) {
      message.error('Failed to fetch doubt details');
      navigate('/faculty/doubts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!answerText.trim()) {
      message.warning('Please enter an answer');
      return;
    }
    if (answerText.length < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }
    if (!id) return;

    try {
      setSubmitting(true);
      await postAnswer(id, answerText);
      message.success('Answer posted successfully!');
      setAnswerText('');
      fetchDoubt(); // Refresh to show new answer
    } catch (error) {
      message.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAnswer = async (answerId: string) => {
    try {
      await verifyAnswer(answerId);
      fetchDoubt();
    } catch (error) {
      message.error('Failed to toggle answer verification');
    }
  };

  const handleEditAnswer = async (answerId: string) => {
    if (!editedAnswerText.trim() || editedAnswerText.length < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }

    try {
      await editAnswer(answerId, editedAnswerText);
      message.success('Answer updated successfully');
      setEditingAnswerId(null);
      setEditedAnswerText('');
      fetchDoubt();
    } catch (error) {
      message.error('Failed to update answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    Modal.confirm({
      title: 'Delete Answer',
      content: 'Are you sure you want to delete this answer? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteAnswer(answerId);
          message.success('Answer deleted successfully');
          fetchDoubt();
        } catch (error) {
          message.error('Failed to delete answer');
        }
      },
    });
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

  if (loading) {
    return (
      <PageTransition>
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      </PageTransition>
    );
  }

  if (!doubt) {
    return (
      <PageTransition>
        <Empty description="Doubt not found" />
      </PageTransition>
    );
  }

  const sortedAnswers = [...(doubt.answers || [])].sort((a, b) => {
    if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return b.upvotes - a.upvotes;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <button 
          onClick={() => navigate('/faculty/doubts')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeftOutlined /> Back to Doubts
        </button>

        {/* Doubt Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border shadow-sm overflow-hidden"
        >
          <div className="relative overflow-hidden bg-linear-to-br from-blue-50 via-violet-50 to-purple-50 dark:from-blue-950/30 dark:via-violet-950/30 dark:to-purple-950/30 p-6">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-400/10 blur-2xl" />
            <div className="relative">
              <h1 className="text-2xl font-bold text-foreground mb-3">{doubt.title}</h1>
              <div className="flex gap-2 flex-wrap">
                <Tag color="purple" className="rounded-full">{doubt.subject}</Tag>
                <Tag className="rounded-full">Semester {doubt.semester}</Tag>
                <Tag color={statusColors[doubt.status]} className="rounded-full px-3 py-1">{doubt.status}</Tag>
                {doubt.labels?.map((label) => (
                  <Tag key={label} color="blue" className="rounded-full">{label}</Tag>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{doubt.description}</p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
              <span className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <EyeOutlined className="text-violet-500" />
                </div>
                {doubt.views} views
              </span>
              <span className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <MessageOutlined className="text-blue-500" />
                </div>
                {doubt.answerCount} answers
              </span>
              <span className="hidden sm:flex items-center gap-2">
                <Avatar size="small">{(doubt.postedBy.name || doubt.postedBy.username || 'U')[0]}</Avatar>
                {doubt.postedBy.name || doubt.postedBy.username}
              </span>
              <span className="hidden md:block">{formatDate(doubt.createdAt)}</span>
              {doubt.editHistory && doubt.editHistory.length > 0 && (
                <Tooltip title={`Edited ${doubt.editHistory.length} time(s)`}>
                  <HistoryOutlined className="text-orange-500" />
                </Tooltip>
              )}
            </div>
          </div>
        </motion.div>

        {/* Answers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              {sortedAnswers.length} Answer{sortedAnswers.length !== 1 ? 's' : ''}
            </h2>
            {sortedAnswers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {sortedAnswers.filter(a => a.isVerified).length} verified
              </p>
            )}
          </div>

          {sortedAnswers.length === 0 ? (
            <Empty description="No answers yet. Be the first to answer!" />
          ) : (
            sortedAnswers.map((answer, i) => {
              const isMyAnswer = user && answer.answeredBy.id === user.id;
              const isEditing = editingAnswerId === answer.id;

              return (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl bg-card border shadow-sm overflow-hidden ${
                    answer.isAccepted ? 'ring-2 ring-green-500 border-green-500' : ''
                  }`}
                >
                  {answer.isAccepted && (
                    <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 px-6 py-2 border-b">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <CheckCircleOutlined className="text-base" />
                        Accepted Answer
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <TextArea
                          value={editedAnswerText}
                          onChange={(e) => setEditedAnswerText(e.target.value)}
                          rows={6}
                          placeholder="Edit your answer"
                          className="rounded-lg"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleEditAnswer(answer.id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors cursor-pointer">Save Changes</button>
                          <button onClick={() => {
                            setEditingAnswerId(null);
                            setEditedAnswerText('');
                          }} className="px-4 py-2 rounded-lg border hover:bg-muted text-sm font-medium transition-colors cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{answer.content}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-2">
                              <Avatar size="small">{(answer.answeredBy.name || answer.answeredBy.username || 'U')[0]}</Avatar>
                              <span className="font-medium text-foreground">
                                {answer.answeredBy.name || answer.answeredBy.username}
                              </span>
                              {answer.answeredBy.role === 'FACULTY' && (
                                <Tag color="gold" className="rounded-full">Faculty</Tag>
                              )}
                            </div>
                            <span>{formatDate(answer.createdAt)}</span>
                            {answer.editHistory && answer.editHistory.length > 0 && (
                              <Tooltip title={`Edited ${answer.editHistory.length} time(s)`}>
                                <HistoryOutlined className="text-orange-500" />
                              </Tooltip>
                            )}
                          </div>
                          <div className='flex gap-2 items-center'>
                            <Tooltip title={answer.isVerified ? "Unverify this answer" : "Verify this answer as faculty-approved"}>
                              <button
                                onClick={() => handleVerifyAnswer(answer.id)}
                                className={`h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                                  answer.isVerified
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                                    : 'hover:bg-muted border'
                                }`}
                              >
                                <SafetyOutlined />
                                {answer.isVerified ? 'Verified ✓' : 'Verify'}
                              </button>
                            </Tooltip>
                            {isMyAnswer && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAnswerId(answer.id);
                                    setEditedAnswerText(answer.content);
                                  }}
                                  className="h-9 px-4 rounded-lg hover:bg-muted border flex items-center gap-2 text-sm transition-colors cursor-pointer"
                                >
                                  <EditOutlined />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  className="h-9 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 border flex items-center gap-2 text-sm transition-colors cursor-pointer"
                                >
                                  <DeleteOutlined />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Answer Submission Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Your Answer</h3>
          <TextArea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer here (minimum 10 characters)..."
            maxLength={2000}
            showCount
            className="rounded-lg mb-4"
          />
          <button
            onClick={handlePostAnswer}
            disabled={answerText.length < 10 || submitting}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              answerText.length < 10 || submitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-linear-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/30'
            }`}
          >
            {submitting ? 'Posting...' : 'Post Answer'}
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyDoubtDetail;
