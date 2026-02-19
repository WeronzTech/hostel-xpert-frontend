import {useState} from "react";
import {Tabs, Card} from "antd";
import {CalendarOutlined, UnlockOutlined} from "@ant-design/icons";
import {useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {PageHeader} from "../../components";
import LeaveManagement from "../../components/leave/LeaveManagement";
import GatePassManagement from "../../components/gatePass/GatePassManagement";

const {TabPane} = Tabs;
const PRIMARY_COLOR = "#059669";

const LeaveGatePassManagement = () => {
  const queryClient = useQueryClient();
  const {selectedProperty} = useSelector((state) => state.properties);
  const [activeTab, setActiveTab] = useState("leave");

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Leave & Gate Pass Management"
        subtitle="Manage student leave requests and gate pass entries"
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{marginBottom: 24}}
        >
          <TabPane
            tab={
              <span>
                <CalendarOutlined style={{color: PRIMARY_COLOR}} />
                Leave Requests
              </span>
            }
            key="leave"
          >
            <LeaveManagement
              selectedProperty={selectedProperty}
              queryClient={queryClient}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <UnlockOutlined style={{color: PRIMARY_COLOR}} />
                Gate Pass Requests
              </span>
            }
            key="gatepass"
          >
            <GatePassManagement
              selectedProperty={selectedProperty}
              queryClient={queryClient}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LeaveGatePassManagement;
