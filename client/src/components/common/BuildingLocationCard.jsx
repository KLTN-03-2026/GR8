import React from 'react';
import { Card, Space, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import VietmapLocation from './VietmapLocation';

const { Text } = Typography;

const BuildingLocationCard = ({ 
  latitude = 21.0285, 
  longitude = 105.8542,
  buildingName = "Tòa nhà",
  address = "",
  height = "300px"
}) => {
  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#4f46e5' }} />
          <span>Vị trí tòa nhà</span>
        </Space>
      }
      variant="outlined"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <VietmapLocation
        latitude={latitude}
        longitude={longitude}
        buildingName={buildingName}
        address={address}
        height={height}
        showMarker={true}
        interactive={true}
      />
      
      <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Text strong>📍 </Text>
            <Text>{address || 'Chưa cập nhật địa chỉ'}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Click vào marker để xem chi tiết và chỉ đường
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default BuildingLocationCard;
