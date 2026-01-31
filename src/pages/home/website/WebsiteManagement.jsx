import {useState} from "react";
import {Row, Col, Divider, message} from "antd";
import {PictureOutlined} from "@ant-design/icons";

import {PageHeader} from "../../../components";
import PropertyForm from "../../../components/website/PropertyForm";
import PropertyCards from "../../../components/website/PropertyCards";
import CommonMediaCards from "../../../components/website/CommonMediaCards";
import CommonMediaForm from "../../../components/website/CommonMediaForm";

const WebsiteManagement = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showCommonForm, setShowCommonForm] = useState(false);
  const [refreshProperties, setRefreshProperties] = useState(0);
  const [refreshCommonContent, setRefreshCommonContent] = useState(0);

  const handlePropertyAdded = () => {
    message.success("Property content added successfully!");
    setShowPropertyForm(false);
    setRefreshProperties((prev) => prev + 1);
  };

  const handleCommonAdded = () => {
    message.success("Common media added successfully!");
    setShowCommonForm(false);
    setRefreshCommonContent((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Website Management"
        subtitle="Manage property content and common media"
      />

      {/* Section 1: Action Buttons */}
      <Row gutter={[16, 16]} justify="center" className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <div
            className="flex flex-col items-center justify-center gap-1 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => setShowPropertyForm(true)}
          >
            <PictureOutlined className="text-xl cursor-pointer" />
            <div className="font-semibold text-gray-800 cursor-pointer">
              Add Property
            </div>
            <div className="text-xs text-gray-500 font-normal cursor-pointer">
              Content, Images & Videos
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div
            className="flex flex-col items-center justify-center gap-1 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => setShowCommonForm(true)}
          >
            <PictureOutlined className="text-xl cursor-pointer" />
            <div className="font-semibold text-gray-800 cursor-pointer">
              Common Media
            </div>
            <div className="text-xs text-gray-500 font-normal cursor-pointer">
              Images & Videos
            </div>
          </div>
        </Col>
      </Row>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          visible={showPropertyForm}
          onClose={() => setShowPropertyForm(false)}
          onSuccess={handlePropertyAdded}
        />
      )}

      {/* Common Media Form Modal */}
      {showCommonForm && (
        <CommonMediaForm
          visible={showCommonForm}
          onClose={() => setShowCommonForm(false)}
          onSuccess={handleCommonAdded}
        />
      )}

      {/* Section 2: Property Cards */}
      <div className="mb-6">
        <Divider orientation="left">
          <h3 className="text-lg font-semibold">Properties</h3>
        </Divider>
        <PropertyCards key={refreshProperties} />
      </div>

      {/* Section 3: Common Media Cards */}
      <div>
        <Divider orientation="left">
          <h3 className="text-lg font-semibold">Common Website Media</h3>
        </Divider>
        <CommonMediaCards key={refreshCommonContent} />
      </div>
    </div>
  );
};

export default WebsiteManagement;
