import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

const FloorStatistics = ({ floors, selectedProperty }) => {
  const statistics = useMemo(() => {
    return {
      totalFloors: floors.length,
      activeFloors: floors.filter(f => f.status === 'Active').length,
      inactiveFloors: floors.filter(f => f.status === 'Inactive').length,
      // maintenanceFloors: floors.filter(f => f.status === 'Maintenance').length,
       totalCapacity: floors.reduce((sum, floor) => sum + (floor.roomCapacity || 0), 0),
      totalVacant: floors.reduce((sum, floor) => sum + (floor.vacantSlot || 0), 0),
      totalOccupied: floors.reduce((sum, floor) => sum + ((floor.roomCapacity || 0) - (floor.vacantSlot || 0)), 0),
      occupancyRate: floors.length > 0 ? ((floors.reduce((sum, floor) => sum + ((floor.roomCapacity || 0) - (floor.vacantSlot || 0)), 0) / 
                         floors.reduce((sum, floor) => sum + (floor.roomCapacity || 0), 0)) * 100) : 0,
      // heavensFloors: floors.filter(f => f.isHeavens).length
    };
  }, [floors]);

  if (!selectedProperty?.id || floors.length === 0) {
    return null;
  }

  const statisticCards = [
    {
      title: "Total Floors",
      value: statistics.totalFloors,
      valueStyle: { color: '#1890ff' },
      prefixColor: '#1890ff',
      description: "All floors in property"
    },
    {
      title: "Active Floors",
      value: statistics.activeFloors,
      valueStyle: { color: '#52c41a' },
      prefixColor: '#52c41a',
      description: "Currently operational floors"
    },
    {
      title: "Total Capacity",
      value: statistics.totalCapacity,
      valueStyle: { color: '#722ed1' },
      prefixColor: '#722ed1',
      description: "Total room capacity across all floors"
    },
    {
      title: "Occupancy Rate",
      value: statistics.occupancyRate,
      precision: 1,
      suffix: "%",
      valueStyle: { 
        color: statistics.occupancyRate >= 80 ? '#f5222d' : 
               statistics.occupancyRate >= 50 ? '#fa8c16' : '#52c41a' 
      },
      prefixColor: statistics.occupancyRate >= 80 ? '#f5222d' : 
                   statistics.occupancyRate >= 50 ? '#fa8c16' : '#52c41a',
      description: "Overall occupancy percentage"
    },
 

 
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#262626' }}>
        Floor Statistics
      </h3>
      <Row gutter={[16, 16]}>
        {statisticCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card 
              size="small" 
              style={{ 
                height: '100%',
                borderLeft: `4px solid ${card.prefixColor}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: card.prefixColor,
                    borderRadius: '50%',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Statistic
                    title={
                      <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                        {card.title}
                      </span>
                    }
                    value={card.value}
                    precision={card.precision}
                    suffix={card.suffix}
                    valueStyle={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      ...card.valueStyle
                    }}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8c8c8c', 
                    lineHeight: '1.4',
                    marginTop: '4px'
                  }}>
                    {card.description}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FloorStatistics;