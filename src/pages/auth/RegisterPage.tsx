import { loginUser, registerUser, storeTokens, clearTokens } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import FaceRegister from '@/components/FaceRegister';
import { UserRole, departments } from '@/types';
import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Select, Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const benefits = [
  {
    title: 'Fast issue reporting',
    description: 'Raise complaints, track resolutions, and keep every update visible from one dashboard.',
  },
  {
    title: 'Academic collaboration',
    description: 'Connect with peers and faculty in a doubt community designed for clear, useful answers.',
  },
];

// Only self-service roles are offered here. ADMIN and SUPER_ADMIN accounts are
// created by an existing super admin — the backend rejects them from this
// public endpoint with 403. See docs/specs/CC-01c-privileged-role-escalation.md
const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Faculty', value: 'FACULTY' },
  // { label: 'Admin', value: 'ADMIN' },
  // { label: 'Super Admin', value: 'SUPER_ADMIN' },
];

const RegisterPage = () => {
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [showFaceRegister, setShowFaceRegister] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    studentId: '',
    facultyId: '',
    adminId: '',
    superAdminId: '',
  });
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!userData.fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!userData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!userData.password.trim()) {
        toast.error('Please enter a password');
        return;
      }
      if (!role) {
        toast.error('Please select a role');
        return;
      }
      if (role === 'STUDENT' && !userData.studentId.trim()) {
        toast.error('Please enter your Student ID');
        return;
      }
      if (role === 'FACULTY' && !userData.facultyId.trim()) {
        toast.error('Please enter your Faculty ID');
        return;
      }
      if (role === 'ADMIN' && !userData.adminId.trim()) {
        toast.error('Please enter your Admin ID');
        return;
      }
      if (role === 'SUPER_ADMIN' && !userData.superAdminId.trim()) {
        toast.error('Please enter your Super Admin ID');
        return;
      }

      setLoading(true);
      const userID =
        role === 'STUDENT'
          ? userData.studentId
          : role === 'FACULTY'
            ? userData.facultyId
            : role === 'ADMIN'
              ? userData.adminId
              : userData.superAdminId;
      const user = await registerUser(userData.fullName, userData.email, userData.password, role, userID);
      void user;
      toast.success('Account created! Set up face login or skip to proceed.');

      try {
        const loginResponse = await loginUser(userData.email, userData.password);
        // CC-01b: store BOTH tokens. Storing only the access token would give
        // this just-registered user a 15-minute session with no way to renew.
        storeTokens(loginResponse.token, loginResponse.refreshToken);
        setShowFaceRegister(true);
      } catch {
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceSuccess = () => {
    toast.success('Face registered! Your account is pending approval.');
    // Clear both, or a stale refresh token is left behind in storage.
    clearTokens();
    setTimeout(() => navigate('/login'), 1000);
  };

  const handleFaceSkip = () => {
    toast.info('Skipped face setup. You can register your face later from your profile.');
    clearTokens();
    setTimeout(() => navigate('/login'), 800);
  };

  if (showFaceRegister) {
    return (
      <AuthSplitLayout
        showcaseEyebrow="Biometric Setup"
        showcaseTitle={
          <>
            Finish With{' '}
            <span className="cc-gradient-text--onDark">
              Face Login Setup
            </span>
          </>
        }
        showcaseDescription="Add Face ID now for quicker sign-ins and a smoother daily workflow."
        highlights={[
          {
            title: 'Quick access from day one',
            description: 'Use your face as a faster sign-in method once your account is approved.',
          },
          {
            title: 'Biometric descriptor usage',
            description: 'Face data is used for authentication only.',
          },
          {
            title: 'Optional during setup',
            description: 'You can complete this step now or skip and add it later from your profile.',
          },
        ]}

        formEyebrow="Final Step"
        formTitle="Set up Face ID"
        formDescription="Complete biometric registration now to unlock faster logins."
      >
        <div className="rounded-[28px] border border-border bg-surface p-3 shadow-none">
          <FaceRegister onSuccess={handleFaceSuccess} onSkip={handleFaceSkip} />
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      showcaseEyebrow="Get Started"
      showcaseTitle={
        <>
          Create Your{' '}
          <span className="cc-gradient-text--onDark">
            CampusCure Account
          </span>
        </>
      }
      showcaseDescription="Join the platform built for smoother complaints, stronger communication, and clearer campus-wide coordination."
      highlights={benefits}
      formEyebrow="Register"
      formTitle="Create your account"
      formDescription="Set up your profile once and get access to the tools your role needs across the platform."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
            Sign In
          </Link>
        </p>
      }
    >

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="cc-label">Full name</label>
          <Input
            size="large"
            prefix={<UserOutlined className="text-muted-foreground" />}
            placeholder="Your full name"
            className="cc-field"
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="cc-label">Email address</label>
          <Input
            size="large"
            prefix={<MailOutlined className="text-muted-foreground" />}
            placeholder="you@campus.edu"
            type="email"
            className="cc-field"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="cc-label">Password</label>
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-muted-foreground" />}
            placeholder="Create a secure password"
            className="cc-field"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="cc-label">Role</label>
          <Select
            size="large"
            placeholder="Select your role"
            className="cc-field w-full"
            value={role || undefined}
            onChange={(value: UserRole) => setRole(value)}
            options={roleOptions}
          />
        </div>

        <AnimatePresence initial={false}>
          {role ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 rounded-3xl border border-border bg-surface p-4">
                {(role === 'STUDENT' || role === 'FACULTY' || role === 'ADMIN') && (
                  <div className="space-y-2">
                    <label className="cc-label">Department</label>
                    <Select
                      size="large"
                      placeholder="Select department"
                      className="cc-field w-full"
                      options={departments.map((department) => ({ label: department, value: department }))}
                      value={userData.department || undefined}
                      onChange={(value) => setUserData({ ...userData, department: value })}
                    />
                  </div>
                )}

                {role === 'STUDENT' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="cc-label">Student ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your student ID"
                      className="cc-field"
                      value={userData.studentId}
                      onChange={(e) => setUserData({ ...userData, studentId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'FACULTY' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="cc-label">Faculty ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your faculty ID"
                      className="cc-field"
                      value={userData.facultyId}
                      onChange={(e) => setUserData({ ...userData, facultyId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'ADMIN' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="cc-label">Admin ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your admin ID"
                      className="cc-field"
                      value={userData.adminId}
                      onChange={(e) => setUserData({ ...userData, adminId: e.target.value })}
                    />
                  </motion.div>
                )}

                {role === 'SUPER_ADMIN' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-2">
                    <label className="cc-label">Super Admin ID</label>
                    <Input
                      size="large"
                      prefix={<IdcardOutlined className="text-muted-foreground" />}
                      placeholder="Enter your super admin ID"
                      className="cc-field"
                      value={userData.superAdminId}
                      onChange={(e) => setUserData({ ...userData, superAdminId: e.target.value })}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="cc-btn cc-btn-primary cc-btn--lg w-full"
        >
          {loading ? <Spin size="small" /> : 'Create Account'}
        </button>
      </div>
    </AuthSplitLayout>
  );
};

export default RegisterPage;
