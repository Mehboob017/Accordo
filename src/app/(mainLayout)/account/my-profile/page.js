import AccountDashboard from '@/components/account/dashboard';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const metadata = {
  title: 'My Profile',
  description: 'Manage your profile and personal information as a registered user on Shree Dhootapapeshwar Limited.',
  alternates: {
    canonical: 'https://www.sdlindia.com/account/my-profile',
  },
};

const Dashboard = () => {
  return (
    <>
      <h1
        className="visually-hidden"
      >
        My Profile - Shree Dhootapapeshwar Limited
      </h1>
      <h2 className="sr-only">This is a my profile page.</h2>
      <ProtectedRoute>
        <AccountDashboard />
      </ProtectedRoute>
    </>
  );
};

export default Dashboard;
