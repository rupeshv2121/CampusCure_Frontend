import { loginUser } from '@/api/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const features = [
  {
    title: 'Real-time complaint tracking',
    description: 'Students and staff can file, route, and monitor issues without relying on scattered updates.',
  },
  {
    title: 'Collaborative doubt community',
    description: 'Academic questions stay visible, searchable, and easier for peers and faculty to resolve together.',
  },
  {
    title: 'Role-based access control',
    description: 'Each user lands in a dashboard tailored to their responsibilities and approval flow.',
  },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirect(user.role, user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(email, password);

      // CC-60: an enrolled user gets a challenge here, not a session. The
      // password alone is no longer enough, and no token exists to store yet.
      if (response.requiresFace) {
        navigate('/face-login', {
          replace: true,
          state: {
            challenge: {
              challengeId: response.challengeId,
              nonce: response.nonce,
              expiresInSeconds: response.expiresInSeconds,
            },
          },
        });
        return;
      }

      login(response.token, response.user, response.refreshToken);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate(getRoleRedirect(response.user.role, response.user));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthSplitLayout
      showcaseTitle={
        <>
          The Smarter Way to{' '}
        <span className="cc-gradient-text--onDark">
            Manage Campus Life
          </span>
        </>
      }
      showcaseDescription="One workspace for complaints & doubts. Built to keep the entire campus community aligned."
      highlights={features}
      formEyebrow="Sign In"
      formTitle="Welcome back"
      formDescription="Access your dashboard, continue active conversations, and keep campus operations moving."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-700 transition-colors hover:text-brand-800">
            Register
          </Link>
        </p>
      }
    >

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="cc-label">Email address</label>
          <Input
            size="large"
            prefix={<UserOutlined className="text-muted-foreground" />}
            placeholder="you@campus.edu"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleLogin}
            className="cc-field"
          />
        </div>

        <div className="space-y-2">
          <label className="cc-label">Password</label>
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-muted-foreground" />}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
          className="cc-field"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
className="cc-btn cc-btn-primary cc-btn--lg w-full"
        >
          {loading ? <Spin size="small" /> : 'Sign In'}
        </button>
      </div>

      {/* CC-60: there is no longer a "log in with your face" entry point.
          Face is the second step for users who enrolled one, reached
          automatically after the password verifies - never a way in on its
          own. The endpoint behind the old button is deleted, not hidden. */}
      <p className="text-center text-xs text-muted-foreground">
        If you have set up Face ID, you will be asked for it after your password.
      </p>
    </AuthSplitLayout>
  );
};

export default LoginPage;
