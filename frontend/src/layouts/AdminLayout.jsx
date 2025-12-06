import React from 'react';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar />
      {/* Main Content with left padding for sidebar */}
      <div className="lg:ml-64 pt-16">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
