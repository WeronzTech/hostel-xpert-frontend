import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {EditOutlined, PrinterOutlined} from "@ant-design/icons";
import {Grid, Card, Button, Modal, Image, message} from "antd";
import PageHeader from "../../components/common/PageHeader";
import ProfileSummary from "../../components/users/detailsPageComponents/ProfileSummary";
import ResidentDetailsTabs from "../../components/users/detailsPageComponents/ResidentDetailsTabs";
import {getResidentById} from "../../hooks/users/useUser";
import {useState} from "react";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner";

const {useBreakpoint} = Grid;

const ResidentDetails = () => {
  const {id} = useParams();
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const screens = useBreakpoint();

  const {
    data: resident,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resident", id],
    queryFn: () => getResidentById(id),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    message.error(error.message || "Failed to load resident data");
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <p>{error.message || "Failed to load resident data"}</p>
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Resident Profile"
        subtitle="Detailed information about the resident"
        breadcrumbs={[
          {name: "Dashboard", href: "/"},
          {name: "Residents", href: "/residents"},
          {name: resident?.name || "Loading...", href: "#"},
        ]}
        actionButtons={
          <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
            <Button icon={<EditOutlined />}>Edit Profile</Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
          </div>
        }
      />

      {resident && (
        <div
          style={{
            display: "flex",
            flexDirection: screens.lg ? "row" : "column",
            gap: "24px",
            marginTop: "24px",
            width: "100%",
          }}
        >
          <div style={{flex: screens.lg ? "0 0 33.3333%" : "100%"}}>
            <ProfileSummary resident={resident} openModal={openModal} />
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <ResidentDetailsTabs resident={resident} openModal={openModal} />
          </div>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        width={screens.xs ? "90%" : 800}
        bodyStyle={{
          padding: 0,
          height: screens.xs ? "auto" : "600px",
          maxHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {modalImage && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src={modalImage}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                display: "block",
              }}
              preview={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResidentDetails;
