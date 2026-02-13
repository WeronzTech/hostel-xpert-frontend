import {useState, useEffect} from "react";
import {Card, Button, Tooltip} from "antd";
import {FiPocket, FiChevronLeft, FiChevronRight, FiPlus} from "react-icons/fi";
import PettyCashModal from "../../modals/accounts/PettyCashModal";
import PettyCashUsageModal from "../../modals/accounts/PettyCashUsageModal";

const PettyCashCard = ({
  inHandAmount,
  inAccountAmount,
  managerName,
  managerId,
  showNavigation,
  onNext,
  onPrev,
  currentIndex,
  totalItems,
  isEmpty = false,
}) => {
  const [isPettyCashModalVisible, setIsPettyCashModalVisible] = useState(false);
  const [isUsageModalVisible, setIsUsageModalVisible] = useState(false);

  // Calculate total amount
  const totalAmount = (inHandAmount || 0) + (inAccountAmount || 0);

  // Calculate percentages
  const inHandPercentage =
    totalAmount > 0 ? (inHandAmount / totalAmount) * 100 : 0;
  const inAccountPercentage =
    totalAmount > 0 ? (inAccountAmount / totalAmount) * 100 : 0;

  if (isEmpty) {
    return (
      <>
        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            height: "100%",
            background: " #059669",
            color: "white",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
          bodyStyle={{padding: "20px"}}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "4px",
              marginBottom: "18px",
              marginLeft: "70px",
            }}
          >
            <FiPocket style={{fontSize: "24px"}} />
          </div>

          <div style={{fontSize: "18px", fontWeight: 500, marginBottom: "8px"}}>
            Petty Cash
          </div>

          <div style={{fontSize: "14px", opacity: 0.8, marginBottom: "22px"}}>
            No petty cash account available
          </div>

          <Button
            style={{
              backgroundColor: "white",
              color: "#059669",
              border: "none",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
              marginLeft: "20px",
            }}
            onClick={() => setIsPettyCashModalVisible(true)}
          >
            <FiPlus /> Setup Petty Cash
          </Button>
        </Card>

        {/* Petty Cash Modal for empty state */}
        <PettyCashModal
          visible={isPettyCashModalVisible}
          onCancel={() => setIsPettyCashModalVisible(false)}
          selectedEmployeeId={managerId}
        />
      </>
    );
  }

  return (
    <>
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
          background: " #059669",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
        bodyStyle={{padding: "20px"}}
      >
        {/* Navigation Arrows - Top Right */}
        {showNavigation && totalItems > 1 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              gap: "4px",
              zIndex: 10,
            }}
          >
            <Button
              style={{
                borderRadius: "50%",
                width: 24,
                height: 24,
                minWidth: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                padding: 0,
              }}
              onClick={onPrev}
            >
              <FiChevronLeft size={14} />
            </Button>
            <Button
              style={{
                borderRadius: "50%",
                width: 24,
                height: 24,
                minWidth: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                padding: 0,
              }}
              onClick={onNext}
            >
              <FiChevronRight size={14} />
            </Button>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "2px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiPocket style={{fontSize: "20px"}} />
          </div>
          <div>
            <div style={{fontSize: "16px", fontWeight: 500}}>Petty Cash</div>
            <div style={{fontSize: "12px", opacity: 0.8}}>
              Managed by {managerName}
            </div>
          </div>
        </div>
        <div
          style={{fontSize: "28px", fontWeight: "bold", marginBottom: "4px"}}
        >
          ₹{totalAmount.toLocaleString("en-IN")}
        </div>

        {/* Amount Distribution Bar with Tooltips */}
        <div style={{marginBottom: "16px"}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            <span>Cash In Hand: ₹{inHandAmount || 0}</span>
            <span>Cash In Account: ₹{inAccountAmount || 0}</span>
          </div>

          {/* Progress Bar Container */}
          <div
            style={{
              display: "flex",
              height: "6px",
              borderRadius: "3px",
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              position: "relative",
            }}
          >
            {/* Cash In Hand Tooltip */}
            {inHandAmount > 0 && (
              <Tooltip
                title={`Cash In Hand: ₹${inHandAmount || 0} (${Math.round(
                  inHandPercentage,
                )}%)`}
                placement="top"
              >
                <div
                  style={{
                    flex: inHandAmount / totalAmount,
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    height: "100%",
                  }}
                />
              </Tooltip>
            )}

            {/* Cash In Account Tooltip */}
            {inAccountAmount > 0 && (
              <Tooltip
                title={`Cash In Account: ₹${inAccountAmount || 0} (${Math.round(
                  inAccountPercentage,
                )}%)`}
                placement="top"
              >
                <div
                  style={{
                    flex: inAccountAmount / totalAmount,
                    backgroundColor: "#ffa940",
                    cursor: "pointer",
                    height: "100%",
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>

        <div style={{display: "flex", gap: "12px"}}>
          <Button
            style={{
              flex: 1,
              backgroundColor: "white",
              color: "#059669",
              border: "none",
              fontWeight: 500,
            }}
            onClick={() => setIsPettyCashModalVisible(true)}
          >
            Add Funds
          </Button>
          <Button
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "none",
            }}
            onClick={() => setIsUsageModalVisible(true)}
          >
            View Usage
          </Button>
        </div>

        {/* Indicators inside the card */}
        {showNavigation && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: "17px",
            }}
          >
            {Array.from({length: totalItems}).map((_, index) => (
              <div
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor:
                    index === currentIndex
                      ? "white"
                      : "rgba(255, 255, 255, 0.4)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Petty Cash Modal for non-empty state */}
      <PettyCashModal
        visible={isPettyCashModalVisible}
        onCancel={() => setIsPettyCashModalVisible(false)}
        selectedEmployeeId={managerId}
      />

      {/* Add the Usage Modal */}
      <PettyCashUsageModal
        visible={isUsageModalVisible}
        onCancel={() => setIsUsageModalVisible(false)}
        managerName={managerName}
        managerId={managerId}
      />
    </>
  );
};

const PettyCashCarousel = ({pettyCashData, loading}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const isEmpty = !pettyCashData || pettyCashData.length === 0;

  const data = isEmpty ? [] : pettyCashData;

  useEffect(() => {
    let interval;
    if (autoPlay && data.length > 1) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % data.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, data.length]);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % data.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + data.length) % data.length);
  };

  // Show loading state if needed
  if (loading) {
    return (
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
          background: " #059669",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
        bodyStyle={{padding: "20px"}}
        loading={true}
      />
    );
  }

  return (
    <div
      style={{position: "relative"}}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {isEmpty ? (
        <PettyCashCard isEmpty={true} />
      ) : (
        <PettyCashCard
          inHandAmount={data[currentSlide]?.inHandAmount}
          inAccountAmount={data[currentSlide]?.inAccountAmount}
          managerName={data[currentSlide]?.managerName}
          managerId={data[currentSlide]?.managerId}
          showNavigation={data.length > 0}
          onNext={nextSlide}
          onPrev={prevSlide}
          currentIndex={currentSlide}
          totalItems={data.length}
        />
      )}
    </div>
  );
};

export default PettyCashCarousel;
