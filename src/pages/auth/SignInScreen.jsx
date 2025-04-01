import { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup } from '../../config/firebase.config';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  Button,
  Card,
  Input,
  message,
} from 'antd';
import {
  GoogleOutlined,
  PhoneOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/context/slice/auth';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8005/api/auth/sync-user';

const SignInScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [step, setStep] = useState('method'); // method | phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔁 Chuyển về trang chủ nếu đã đăng nhập
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider.setCustomParameters({ prompt: 'select_account' }));
      const user = result.user;
      const idToken = await user.getIdToken();
  
      // 👉 gửi kèm avatar (photoURL) về backend nếu cần
      await syncUserWithBackend(idToken, {
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      });
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      message.error('Đăng nhập thất bại!');
    }
  };
  

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    if (!phone) return message.error('Vui lòng nhập số điện thoại');
    try {
      setLoading(true);
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      message.success('Đã gửi mã OTP');
    } catch (error) {
      console.error(error);
      message.error('Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return message.error('Vui lòng nhập mã OTP');
    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      await syncUserWithBackend(idToken);
    } catch (error) {
      console.error(error);
      message.error('Xác minh OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const syncUserWithBackend = async (idToken, extraData = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(extraData), // 👈 Gửi thêm name, email, avatar nếu có
      });
  
      const data = await response.json();
      if (response.ok) {
        dispatch(loginSuccess(data.user));
        message.success('Đăng nhập thành công');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Đồng bộ thất bại:', error);
      message.error('Không thể đồng bộ người dùng');
    }
  };
  

  // 👉 UI render theo step
  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>Nhập số điện thoại</h2>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+84xxxxxxxxx'
              className='mb-4'
            />
            <div id='recaptcha-container' />
            <Button type='primary' loading={loading} className='w-full' onClick={handleSendOtp}>
              Gửi mã OTP
            </Button>
            <Button type='link' className='mt-2' onClick={() => setStep('method')}>
              Quay lại
            </Button>
          </>
        );
      case 'otp':
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>Nhập mã OTP</h2>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder='Nhập mã OTP'
              prefix={<LockOutlined />}
              className='mb-4'
            />
            <Button type='primary' loading={loading} className='w-full' onClick={handleVerifyOtp}>
              Xác minh OTP
            </Button>
          </>
        );
      default:
        return (
          <>
            <h2 className='text-lg font-semibold mb-4'>Chọn phương thức đăng nhập</h2>
            <Button type='primary' icon={<GoogleOutlined />} className='w-full mb-3' onClick={handleGoogleLogin}>
              Đăng nhập với Google
            </Button>
            <Button icon={<PhoneOutlined />} className='w-full' onClick={() => setStep('phone')}>
              Đăng nhập bằng số điện thoại
            </Button>
          </>
        );
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <Card className='shadow-lg p-6 rounded-lg w-full max-w-md text-center'>
        {renderStep()}
      </Card>
    </div>
  );
};

export default SignInScreen;
