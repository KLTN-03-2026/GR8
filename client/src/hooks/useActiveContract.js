// Hook để check xem user có hợp đồng đang hoạt động không
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export const useActiveContract = () => {
  const { user } = useAuth();
  const [hasActiveContract, setHasActiveContract] = useState(null); // null = loading, true/false = result
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveContract = async () => {
      if (!user) {
        setHasActiveContract(false);
        setLoading(false);
        return;
      }

      const role = user.roles?.TenVaiTro || user.VaiTro;
      
      // Nếu không phải NguoiThue hoặc KhachVangLai thì không cần check
      if (role !== 'NguoiThue' && role !== 'KhachVangLai') {
        setHasActiveContract(true);
        setLoading(false);
        return;
      }

      try {
        // Gọi API lấy danh sách hợp đồng của user
        const res = await axios.get('/hopdong/my');
        const contracts = res.data?.data || res.data || [];
        
        // Check xem có hợp đồng nào đang active không
        // DaKy = đã ký nhưng chưa vào ở, DangThue = đang thuê
        const hasActive = contracts.some(contract => 
          contract.TrangThai === 'DaKy' || contract.TrangThai === 'DangThue'
        );
        
        setHasActiveContract(hasActive);
      } catch (error) {
        console.error('Error checking active contract:', error);
        // Nếu lỗi, coi như không có hợp đồng
        setHasActiveContract(false);
      } finally {
        setLoading(false);
      }
    };

    checkActiveContract();
  }, [user]);

  return { hasActiveContract, loading, isGuest: !hasActiveContract };
};
