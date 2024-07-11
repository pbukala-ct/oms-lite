import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { verifyCustomer } from '../utils/verifyCustomer';
import ErrorToast from '../components/ErrorToast';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await verifyCustomer(email, password);
    setLoading(false);

    if (result.success) {
      localStorage.setItem('selectedChannel', result.storeId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('allStores', false);
      localStorage.setItem('authToken', result.token); // Store the auth token
      router.push('/orders');
    } else {
      setError(result.message);
    }
  };

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-ct-blue-light py-12 px-4 sm:px-6 lg:px-8">
      {error && <ErrorToast message={error} onClose={() => setError('')} />}
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-64 h-24 relative mb-8">
            <Image
              src="/commercetools-logo.png"
              alt="Commercetools"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-ct-blue-dark">
            commercetools OMS Lite 
        
            
          </h2>
          <h3>Sign in to your account</h3>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-ct-blue focus:border-ct-blue focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
           
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-ct-blue focus:border-ct-blue focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )} */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ct-blue hover:bg-ct-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ct-blue"
            >
             {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}