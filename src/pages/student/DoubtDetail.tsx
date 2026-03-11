import { deleteAnswer, deleteDoubt, editAnswer, editDoubt, getDoubtById, markAnswerAsAccepted, postAnswer, upvoteAnswer } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Doubt } from '@/types';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  LikeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Avatar, Empty, Input, message, Modal, Spin, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { TextArea } = Input;

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };

const DoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDoubt, setEditedDoubt] = useState({ title: '', description: '' });
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
      setEditedDoubt({ title: data.title, description: data.description });
    } catch (error) {
      message.error('Failed to fetch doubt details');
      navigate('/student/doubts');
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

  const handleUpvote = async (answerId: string) => {
    try {
      await upvoteAnswer(answerId);
      fetchDoubt(); // Refresh to update counts and upvote status
    } catch (error) {
      message.error('Failed to toggle upvote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!id) return;
    try {
      await markAnswerAsAccepted(id, answerId);
      fetchDoubt();
    } catch (error) {
      message.error('Failed to toggle answer acceptance');
    }
  };

  const handleEditDoubt = async () => {
    if (!id) return;
    if (!editedDoubt.title.trim() || !editedDoubt.description.trim()) {
      message.warning('Title and description are required');
      return;
    }

    try {
      await editDoubt(id, {
        title: editedDoubt.title,
        description: editedDoubt.description,
      });
      message.success('Doubt updated successfully');
      setEditMode(false);
      fetchDoubt();
    } catch (error) {
      message.error('Failed to update doubt');
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

  const handleDeleteDoubt = async () => {
    if (!id) return;
    Modal.confirm({
      title: 'Delete Doubt',
      content: 'Are you sure you want to delete this doubt? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteDoubt(id);
          message.success('Doubt deleted successfully');
          navigate('/student/doubts');
        } catch (error) {
          message.error('Failed to delete doubt');
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

  const isDoubtOwner = doubt && user && doubt.postedBy.id === user.id;

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
          onClick={() => navigate('/student/doubts')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeftOutlined /> Back to Community
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
              {editMode ? (
                <div className="space-y-4">
                  <Input
                    value={editedDoubt.title}
                    onChange={(e) => setEditedDoubt({ ...editedDoubt, title: e.target.value })}
                    placeholder="Doubt title"
                    className="text-lg rounded-lg"
                  />
                  <TextArea
                    value={editedDoubt.description}
                    onChange={(e) => setEditedDoubt({ ...editedDoubt, description: e.target.value })}
                    rows={6}
                    placeholder="Doubt description"
                    className="rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleEditDoubt} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors cursor-pointer">Save Changes</button>
                    <button onClick={() => { setEditMode(false); setEditedDoubt({ title: doubt.title, description: doubt.description }); }} className="px-4 py-2 rounded-lg border hover:bg-muted text-sm font-medium transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-foreground mb-2">{doubt.title}</h1>
                      <div className="flex gap-2 flex-wrap">
                        <Tag color="purple" className="rounded-full">{doubt.subject}</Tag>
                        <Tag className="rounded-full">Semester {doubt.semester}</Tag>
                        {doubt.labels?.map((label) => (
                          <Tag key={label} color="blue" className="rounded-full">{label}</Tag>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Tag color={statusColors[doubt.status]} className="rounded-full px-3 py-1">{doubt.status}</Tag>
                      {isDoubtOwner && (
                        <>
                          <button onClick={() => setEditMode(true)} className="h-8 w-8 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer">
                            <EditOutlined />
                          </button>
                          <button onClick={handleDeleteDoubt} className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 flex items-center justify-center transition-colors cursor-pointer">
                            <DeleteOutlined />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {!editMode && (
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
          )}
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
                        <div className="flex justify-between gap-6">
                          <p className="text-foreground whitespace-pre-wrap flex-1 leading-relaxed">{answer.content}</p>
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <Tooltip title={answer.isUpvotedByUser ? "Remove upvote" : "Upvote this answer"}>
                              <button
                                onClick={() => handleUpvote(answer.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
                                  answer.isUpvotedByUser 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                                    : 'hover:bg-muted'
                                }`}
                              >
                                <LikeOutlined className="text-lg" />
                                <span className="text-sm font-bold">{answer.upvotes}</span>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                        
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
                            {answer.isVerified && (
                              <Tag color="blue" className="rounded-full">✓ Verified</Tag>
                            )}
                          </div>
                          <div className='flex gap-2 items-center'>
                            {isDoubtOwner && (
                              <Tooltip title={answer.isAccepted ? "Unaccept this answer" : "Mark as accepted answer"}>
                                <button
                                  onClick={() => handleAcceptAnswer(answer.id)}
                                  className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                                    answer.isAccepted
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                      : 'hover:bg-muted'
                                  }`}
                                >
                                  <CheckCircleOutlined />
                                  {answer.isAccepted ? 'Accepted' : 'Accept'}
                                </button>
                              </Tooltip>
                            )}
                            {isMyAnswer && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAnswerId(answer.id);
                                    setEditedAnswerText(answer.content);
                                  }}
                                  className="h-8 px-3 rounded-lg hover:bg-muted flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
                                >
                                  <EditOutlined />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  className="h-8 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
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

export default DoubtDetail;