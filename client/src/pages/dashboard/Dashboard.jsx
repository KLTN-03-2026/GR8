// client/src/pages/dashboard/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Xin chào, {user.HoTen || 'User'}!</h2>
        <p className="text-gray-600">Vai trò: {user.VaiTro || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kỹ thuật viên */}
        {['NhanVienKyThuat', 'QuanLy'].includes(user.VaiTro) && (
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">📝 Ghi Chỉ Số</h3>
            <p className="mb-4">Ghi chỉ số điện nước hàng tháng</p>
            <a
              href="/meter-reading"
              className="inline-block bg-white text-blue-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Bắt đầu →
            </a>
          </div>
        )}

        {/* Kế toán */}
        {['KeToan', 'QuanLy'].includes(user.VaiTro) && (
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">⏳ Chờ Duyệt</h3>
            <p className="mb-4">Xác nhận chỉ số và phát hành hóa đơn</p>
            <a
              href="/pending-readings"
              className="inline-block bg-white text-green-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Xem ngay →
            </a>
          </div>
        )}

        {/* Người thuê */}
        {user.VaiTro === 'NguoiThue' && (
          <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">💳 Hóa Đơn</h3>
            <p className="mb-4">Xem và thanh toán hóa đơn</p>
            <a
              href="/my-invoices"
              className="inline-block bg-white text-purple-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Xem hóa đơn →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
