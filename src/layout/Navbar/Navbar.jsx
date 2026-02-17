import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  FiUser,
  FiBell,
  FiMenu,
  FiGrid,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiAlertCircle,
  FiHome,
  MdAccountBalance,
  MdRestaurantMenu,
  HiOutlineUserGroup,
  LuCircleArrowOutUpLeft,
  FaHistory,
} from "../../icons/index.js";
import {useState, useEffect, useMemo} from "react";
import ConfirmModal from "../../modals/common/ConfirmModal";
import {logout} from "../../redux/authSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {getAllHeavensProperties} from "../../hooks/property/useProperty.js";
import {selectProperty, setProperties} from "../../redux/propertiesSlice.js";
import {
  Dropdown,
  Menu,
  Layout,
  Button,
  Space,
  Typography,
  Badge,
  Drawer,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {getRoleById} from "../../hooks/employee/useEmployee.js";
import {FiSliders} from "react-icons/fi";
import CarouselManagementModal from "../../modals/common/CarouselManagement.jsx";
import RefferalSettingsModal from "../../modals/common/referralSettingsModal.jsx";
import GameManagementModal from "../../modals/users/GameManagementModal.jsx";
import MaintenanceCountBadge from "../../components/maintenance/MaintenanceCountBadge.jsx";
import {useMaintenanceCount} from "../../hooks/maintenance/useMaintenanceCount.js";
import {useRequestCount} from "../../hooks/offboarding/useRequestCount.js";
import RequestCountBadge from "../../components/offboarding/RequestCountBadge.jsx";
import {HiOutlineCalendarDays} from "react-icons/hi2";
import {HiOutlineDocumentText} from "react-icons/hi";

const {Header} = Layout;
const {Text} = Typography;

const Navbar = () => {
  const {user} = useSelector((state) => state.auth);
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [isReferralSettingsModalOpen, setIsReferralSettingsModalOpen] =
    useState(false);
  const [isGameManagementModalOpen, setIsGameManagementModalOpen] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [residentsDropdownOpen, setResidentsDropdownOpen] = useState(false);
  const [messDropdownOpen, setMessDropdownOpen] = useState(false);
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const roleId = useSelector((state) => state?.auth?.user?.role?.id);

  const {data: role} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
  });

  const permissions = role?.permissions;

  const hasPermission = (requiredPermission) => {
    if (permissions?.includes("ALL_PRIVILEGES")) {
      return true;
    }
    return permissions?.includes(requiredPermission);
  };

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Close mobile menu when any modal opens
  useEffect(() => {
    if (
      isCarouselModalOpen ||
      isReferralSettingsModalOpen ||
      isGameManagementModalOpen ||
      isLogoutModalOpen
    ) {
      setMobileMenuOpen(false);
    }
  }, [
    isCarouselModalOpen,
    isReferralSettingsModalOpen,
    isGameManagementModalOpen,
    isLogoutModalOpen,
  ]);

  const handleNotificationMenuClick = ({key}) => {
    if (key === "1") navigate("/notification/push-notification");
    else if (key === "2") navigate("/notification/alert-notification");
    else if (key === "3") navigate("/notification/notification-logs");
    setMobileMenuOpen(false);
  };

  const handleSettingsMenuClick = ({key}) => {
    if (key === "1") handleCarouselClick();
    else if (key === "2") handleRefferalClick();
    else if (key === "3") handleGameManagementClick();
    setMobileMenuOpen(false);
  };

  const handleRefferalClick = () => {
    setIsReferralSettingsModalOpen(true);
  };

  const handleCarouselClick = () => {
    setIsCarouselModalOpen(true);
  };

  const handleGameManagementClick = () => {
    setIsGameManagementModalOpen(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const notificationItems = [
    hasPermission("/notification/push-notification") && {
      key: "1",
      label: "Push Notification",
    },
    hasPermission("/notification/alert-notification") && {
      key: "2",
      label: "Alert Notification",
    },
    hasPermission("/notification/notification-logs") && {
      key: "3",
      label: "Notification Logs",
    },
  ].filter(Boolean);

  const settingsItems = [
    hasPermission("CAROUSEL_MANAGE") && {
      key: "1",
      label: "Carousel Management",
    },
    hasPermission("REFERRAL_MANAGE") && {
      key: "2",
      label: "Referral Management",
    },
    hasPermission("GAMING_MANAGE") && {
      key: "3",
      label: "Game Management",
    },
  ].filter(Boolean);

  const userRoutes = [
    {path: "/monthlyRent", label: "Monthly Rent", permission: "/monthlyRent"},
    {path: "/dailyRent", label: "Daily Rent", permission: "/dailyRent"},
    {path: "/food-only", label: "Mess Only", permission: "/food-only"},
  ];

  const canViewAccounts = hasPermission("/accounts");
  const canViewAccounting = hasPermission("/accounting");
  const canViewProperties = hasPermission("/property");
  const canViewRooms = hasPermission("/rooms");
  const canViewFloors = hasPermission("/floor");
  const canViewOrderDetails = hasPermission("/mess");
  const canViewKitchens = hasPermission("/kitchen");
  const canViewDailyUsage = hasPermission("/stock-usage");

  const propertyRoutes = [
    {path: "/property", label: "Properties", canView: canViewProperties},
    {path: "/floor", label: "Floors", canView: canViewFloors},
    {path: "/rooms", label: "Rooms", canView: canViewRooms},
  ];

  const kitchenRoutes = [
    {path: "/mess", label: "Order Details", canView: canViewOrderDetails},
    {path: "/kitchen", label: "Kitchen", canView: canViewKitchens},
    {path: "/stock-usage", label: "Daily Usage", canView: canViewDailyUsage},
  ];

  const allowedKitchenRoutes = kitchenRoutes.filter((route) => route.canView);
  const allowedPropertyRoutes = propertyRoutes.filter((route) => route.canView);
  const allowedUserRoutes = userRoutes.filter((route) =>
    hasPermission(route.permission),
  );

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getAllHeavensProperties();
        dispatch(
          setProperties(
            data.map((p) => ({
              name: p.propertyName,
              _id: p._id,
            })),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };
    fetchProperties();
  }, [dispatch]);

  const propertyList = useMemo(() => {
    if (!properties) return [];
    if (user?.role?.name === "Admin") {
      const hasAllOption = properties.some((p) => p.name === "All Properties");
      return hasAllOption
        ? properties
        : [{name: "All Properties", _id: "all"}, ...properties];
    }
    return properties.filter((p) => user?.properties?.includes(p._id));
  }, [properties, user]);

  const filteredList = propertyList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (
      user?.role?.name !== "Admin" &&
      user?.properties?.length > 0 &&
      !selectedProperty?.id
    ) {
      const firstPropertyId = user.properties[0];
      const firstProperty = properties?.find((p) => p._id === firstPropertyId);
      if (firstProperty) {
        dispatch(
          selectProperty({
            name: `${user.companyName} - ${firstProperty.name}`,
            id: firstProperty._id,
          }),
        );
      }
    }
  }, [user, properties, selectedProperty, dispatch]);

  const handlePropertySelect = (property) => {
    const selected =
      property.name === "All Properties"
        ? {name: "", id: null}
        : {name: `${user.companyName} - ${property.name}`, id: property._id};
    dispatch(selectProperty(selected));
  };

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  const isMoreActive = () => {
    return isActive("/activity-logs") || isActive("/assets");
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    dispatch(
      logout({
        showModal: false,
        reason: "user_initiated",
      }),
    );
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const handleModalClose = () => {
    setIsLogoutModalOpen(false);
  };

  const maintenanceCount = useMaintenanceCount();
  const requestCount = useRequestCount();

  // Property selector menu
  const propertyMenu = (
    <Menu
      className="property-dropdown-antd"
      style={{maxHeight: "400px", overflow: "auto", minWidth: "250px"}}
    >
      {filteredList.map((property) => {
        const isSelected =
          (!selectedProperty?.id && property.name === "All Properties") ||
          selectedProperty?.id === property._id;
        return (
          <Menu.Item
            key={property._id || property.name}
            onClick={() => handlePropertySelect(property)}
            style={{
              backgroundColor: isSelected ? "#f3f4f6" : "transparent",
              color: isSelected ? "#059669" : "inherit",
              fontWeight: isSelected ? "600" : "normal",
            }}
          >
            <Space style={{justifyContent: "space-between", width: "100%"}}>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: isSelected ? "600" : "600",
                }}
              >
                {property.name}
              </span>
              {isSelected && <span style={{color: "#059669"}}>✓</span>}
            </Space>
          </Menu.Item>
        );
      })}
      {filteredList.length === 0 && (
        <Menu.Item disabled style={{textAlign: "center", color: "#999"}}>
          No properties found
        </Menu.Item>
      )}
    </Menu>
  );

  // Function to get button style based on active state
  const getButtonStyle = (isActive) => ({
    color: "white",
    height: "auto",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: isActive ? "600" : "500",
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
  });

  // Desktop Navigation Items
  const renderDesktopNavItems = () => (
    <Space size="middle" className="nav-items" style={{gap: "0.5rem"}}>
      {hasPermission("/") && (
        <Link to="/">
          <Button
            type="text"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            icon={<FiGrid size={20} />}
            style={getButtonStyle(isActive("/"))}
          >
            <span>Dashboard</span>
          </Button>
        </Link>
      )}
      {allowedPropertyRoutes.length > 0 && (
        <>
          {allowedPropertyRoutes.length > 1 ? (
            <Dropdown
              overlay={
                <Menu>
                  {allowedPropertyRoutes.map((route) => {
                    const isRouteActive = isActive(route.path);
                    return (
                      <Menu.Item
                        key={route.path}
                        style={{
                          backgroundColor: isRouteActive
                            ? "#f0f0f0"
                            : "transparent",
                        }}
                      >
                        <Link
                          to={route.path}
                          style={{
                            color: isRouteActive ? "#059669" : "inherit",
                            display: "block",
                            padding: "5px 12px",
                            fontWeight: isRouteActive ? "600" : "600",
                          }}
                        >
                          {route.label}
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
              trigger={["hover"]}
              placement="bottom"
              onOpenChange={(open) => setPropertyDropdownOpen(open)}
            >
              <Button
                type="text"
                className={`nav-link dropdown-container ${
                  allowedPropertyRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={getButtonStyle(
                  allowedPropertyRoutes.some((route) => isActive(route.path)),
                )}
              >
                <FiHome size={20} />
                <Space size={4}>
                  <span>Property</span>
                  {propertyDropdownOpen ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Link to={allowedPropertyRoutes[0].path}>
              <Button
                type="text"
                className={`nav-link ${
                  isActive(allowedPropertyRoutes[0].path) ? "active" : ""
                }`}
                icon={<FiHome size={20} />}
                style={getButtonStyle(isActive(allowedPropertyRoutes[0].path))}
              >
                <span>{allowedPropertyRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </>
      )}
      {allowedUserRoutes.length > 0 && (
        <>
          {allowedUserRoutes.length > 1 ? (
            <Dropdown
              overlay={
                <Menu>
                  {allowedUserRoutes.map((route) => {
                    const isRouteActive = isActive(route.path);
                    return (
                      <Menu.Item
                        key={route.path}
                        style={{
                          backgroundColor: isRouteActive
                            ? "#f0f0f0"
                            : "transparent",
                        }}
                      >
                        <Link
                          to={route.path}
                          style={{
                            color: isRouteActive ? "#059669" : "inherit",
                            display: "block",
                            padding: "5px 12px",
                            fontWeight: isRouteActive ? "600" : "600",
                          }}
                        >
                          {route.label}
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
              trigger={["hover"]}
              placement="bottom"
              onOpenChange={(open) => setResidentsDropdownOpen(open)}
            >
              <Button
                type="text"
                className={`nav-link dropdown-container ${
                  allowedUserRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={getButtonStyle(
                  allowedUserRoutes.some((route) => isActive(route.path)),
                )}
              >
                <FiUsers size={20} />
                <Space size={4}>
                  <span>Users</span>
                  {residentsDropdownOpen ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Link to={allowedUserRoutes[0].path}>
              <Button
                type="text"
                className={`nav-link ${
                  isActive(allowedUserRoutes[0].path) ? "active" : ""
                }`}
                icon={<FiUsers size={20} />}
                style={getButtonStyle(isActive(allowedUserRoutes[0].path))}
              >
                <span>{allowedUserRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </>
      )}
      {hasPermission("/attendance") && (
        <Link to="/attendance">
          <Button
            type="text"
            className={`nav-link ${isActive("/attendance") ? "active" : ""}`}
            icon={<HiOutlineCalendarDays size={20} />}
            style={getButtonStyle(isActive("/attendance"))}
          >
            <span>Attendance</span>
          </Button>
        </Link>
      )}
      {hasPermission("/leave") && (
        <Link to="/leave">
          <Button
            type="text"
            className={`nav-link ${isActive("/leave") ? "active" : ""}`}
            icon={<HiOutlineDocumentText size={20} />}
            style={getButtonStyle(isActive("/leave"))}
          >
            <span>Leave</span>
          </Button>
        </Link>
      )}
      {hasPermission("/employees") && (
        <Link to="/employees">
          <Button
            type="text"
            className={`nav-link ${isActive("/employees") ? "active" : ""}`}
            icon={<HiOutlineUserGroup size={20} />}
            style={getButtonStyle(isActive("/employees"))}
          >
            <span>Employees</span>
          </Button>
        </Link>
      )}
      {allowedKitchenRoutes.length > 0 && (
        <>
          {allowedKitchenRoutes.length > 1 ? (
            <Dropdown
              overlay={
                <Menu>
                  {allowedKitchenRoutes.map((route) => {
                    const isRouteActive = isActive(route.path);
                    return (
                      <Menu.Item
                        key={route.path}
                        style={{
                          backgroundColor: isRouteActive
                            ? "#f0f0f0"
                            : "transparent",
                        }}
                      >
                        <Link
                          to={route.path}
                          style={{
                            color: isRouteActive ? "#059669" : "inherit",
                            display: "block",
                            padding: "5px 12px",
                            fontWeight: isRouteActive ? "600" : "600",
                          }}
                        >
                          {route.label}
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
              trigger={["hover"]}
              placement="bottom"
              onOpenChange={(open) => setMessDropdownOpen(open)}
            >
              <Button
                type="text"
                className={`nav-link dropdown-container ${
                  allowedKitchenRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={getButtonStyle(
                  allowedKitchenRoutes.some((route) => isActive(route.path)),
                )}
              >
                <MdRestaurantMenu size={20} />
                <Space size={4}>
                  <span>Mess</span>
                  {messDropdownOpen ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Link to={allowedKitchenRoutes[0].path}>
              <Button
                type="text"
                className={`nav-link ${
                  isActive(allowedKitchenRoutes[0].path) ? "active" : ""
                }`}
                icon={<MdRestaurantMenu size={20} />}
                style={getButtonStyle(isActive(allowedKitchenRoutes[0].path))}
              >
                <span>{allowedKitchenRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </>
      )}
      {hasPermission("/maintenance") && (
        <Link to="/maintenance">
          <Badge
            count={maintenanceCount}
            offset={[-5, 5]}
            style={{backgroundColor: "#f5222d"}}
          >
            <Button
              type="text"
              className={`nav-link ${isActive("/maintenance") ? "active" : ""}`}
              icon={<FiAlertCircle size={20} />}
              style={getButtonStyle(isActive("/maintenance"))}
            >
              <span>Maintenance</span>
            </Button>
          </Badge>
        </Link>
      )}
      {(canViewAccounts || canViewAccounting) && (
        <>
          {canViewAccounts && canViewAccounting ? (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="accounts"
                    style={{
                      backgroundColor: isActive("/accounts")
                        ? "#f0f0f0"
                        : "transparent",
                    }}
                  >
                    <Link
                      to="/accounts"
                      style={{
                        color: isActive("/accounts") ? "#059669" : "inherit",
                        display: "block",
                        padding: "5px 12px",
                        fontWeight: isActive("/accounts") ? "600" : "600",
                      }}
                    >
                      Overview
                    </Link>
                  </Menu.Item>
                  <Menu.Item
                    key="accounting"
                    style={{
                      backgroundColor: isActive("/accounting")
                        ? "#f0f0f0"
                        : "transparent",
                    }}
                  >
                    <Link
                      to="/accounting"
                      style={{
                        color: isActive("/accounting") ? "#059669" : "inherit",
                        display: "block",
                        padding: "5px 12px",
                        fontWeight: isActive("/accounting") ? "600" : "600",
                      }}
                    >
                      Accountant
                    </Link>
                  </Menu.Item>
                </Menu>
              }
              trigger={["hover"]}
              placement="bottom"
              onOpenChange={(open) => setAccountsDropdownOpen(open)}
            >
              <Button
                type="text"
                className={`nav-link dropdown-container ${
                  isActive("/accounts") || isActive("/accounting")
                    ? "active"
                    : ""
                }`}
                style={getButtonStyle(
                  isActive("/accounts") || isActive("/accounting"),
                )}
              >
                <MdAccountBalance size={20} />
                <Space size={4}>
                  <span>Accounts</span>
                  {accountsDropdownOpen ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Link to={canViewAccounts ? "/accounts" : "/accounting"}>
              <Button
                type="text"
                className={`nav-link ${
                  isActive("/accounts") || isActive("/accounting")
                    ? "active"
                    : ""
                }`}
                icon={<MdAccountBalance size={20} />}
                style={getButtonStyle(
                  isActive("/accounts") || isActive("/accounting"),
                )}
              >
                <span>{canViewAccounts ? "Accounts" : "Accountant"}</span>
              </Button>
            </Link>
          )}
        </>
      )}
      {hasPermission("/offboarding") && (
        <Link to="/offboarding">
          <Badge
            count={requestCount}
            offset={[-5, 5]}
            style={{backgroundColor: "#f5222d"}}
          >
            <Button
              type="text"
              className={`nav-link ${isActive("/offboarding") ? "active" : ""}`}
              icon={<LuCircleArrowOutUpLeft size={18} />}
              style={getButtonStyle(isActive("/offboarding"))}
            >
              <span>Off Boarding</span>
            </Button>
          </Badge>
        </Link>
      )}
      {hasPermission("/activity-logs") && (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="logs"
                style={{
                  backgroundColor: isActive("/activity-logs")
                    ? "#f0f0f0"
                    : "transparent",
                }}
              >
                <Link
                  to="/activity-logs"
                  style={{
                    color: isActive("/activity-logs") ? "#059669" : "inherit",
                    display: "block",
                    padding: "5px 12px",
                    fontWeight: isActive("/activity-logs") ? "600" : "600",
                  }}
                >
                  Logs
                </Link>
              </Menu.Item>
              <Menu.Item
                key="assets"
                style={{
                  backgroundColor: isActive("/assets")
                    ? "#f0f0f0"
                    : "transparent",
                }}
              >
                <Link
                  to="/assets"
                  style={{
                    color: isActive("/assets") ? "#059669" : "inherit",
                    display: "block",
                    padding: "5px 12px",
                    fontWeight: isActive("/assets") ? "600" : "600",
                  }}
                >
                  Assets
                </Link>
              </Menu.Item>
            </Menu>
          }
          trigger={["hover"]}
          placement="bottom"
          onOpenChange={(open) => setMoreDropdownOpen(open)}
        >
          <Button
            type="text"
            className={`nav-link dropdown-container ${
              isMoreActive() ? "active" : ""
            }`}
            style={getButtonStyle(isMoreActive())}
          >
            <FaHistory size={18} />
            <Space size={4}>
              <span>More</span>
              {moreDropdownOpen ? (
                <FiChevronUp size={16} />
              ) : (
                <FiChevronDown size={16} />
              )}
            </Space>
          </Button>
        </Dropdown>
      )}
    </Space>
  );

  // Function to get mobile button style based on active state
  const getMobileButtonStyle = (isActive) => ({
    color: "white",
    width: "100%",
    textAlign: "left",
    justifyContent: "flex-start",
    padding: "1rem",
    height: "auto",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontWeight: isActive ? "600" : "500",
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
  });

  // Function to get mobile sublink style based on active state
  const getMobileSublinkStyle = (isActive) => ({
    color: "rgba(255,255,255,0.9)",
    width: "100%",
    textAlign: "left",
    padding: "0.75rem 1rem",
    height: "auto",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: isActive ? "600" : "normal",
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    borderRadius: "4px",
    marginBottom: "2px",
  });

  // Mobile Navigation Items
  const renderMobileNavItems = () => (
    <div style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
      {hasPermission("/") && (
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          <Button
            type="text"
            className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
            icon={<FiGrid size={20} />}
            style={getMobileButtonStyle(isActive("/"))}
          >
            <span>Dashboard</span>
          </Button>
        </Link>
      )}

      {allowedPropertyRoutes.length > 0 && (
        <div style={{display: "flex", flexDirection: "column"}}>
          {allowedPropertyRoutes.length > 1 ? (
            <>
              <Button
                type="text"
                onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
                className={`mobile-nav-link ${
                  allowedPropertyRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={{
                  color: "white",
                  width: "100%",
                  textAlign: "left",
                  justifyContent: "space-between",
                  padding: "1rem",
                  height: "auto",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: allowedPropertyRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent",
                  borderRadius: "6px",
                  fontWeight: allowedPropertyRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "600"
                    : "500",
                }}
              >
                <Space size={12}>
                  <FiHome size={20} />
                  <span>Property</span>
                </Space>
                {propertyDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
              {propertyDropdownOpen && (
                <div
                  style={{
                    paddingLeft: "1rem",
                    marginLeft: "2rem",
                    borderLeft: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {allowedPropertyRoutes.map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        type="text"
                        className={`mobile-dropdown-link ${
                          isActive(route.path) ? "active" : ""
                        }`}
                        style={getMobileSublinkStyle(isActive(route.path))}
                      >
                        • {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              to={allowedPropertyRoutes[0].path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                type="text"
                className={`mobile-nav-link ${
                  isActive(allowedPropertyRoutes[0].path) ? "active" : ""
                }`}
                icon={<FiHome size={20} />}
                style={getMobileButtonStyle(
                  isActive(allowedPropertyRoutes[0].path),
                )}
              >
                <span>{allowedPropertyRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </div>
      )}

      {allowedUserRoutes.length > 0 && (
        <div style={{display: "flex", flexDirection: "column"}}>
          {allowedUserRoutes.length > 1 ? (
            <>
              <Button
                type="text"
                onClick={() => setResidentsDropdownOpen(!residentsDropdownOpen)}
                className={`mobile-nav-link ${
                  allowedUserRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={{
                  color: "white",
                  width: "100%",
                  textAlign: "left",
                  justifyContent: "space-between",
                  padding: "1rem",
                  height: "auto",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: allowedUserRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent",
                  borderRadius: "6px",
                  fontWeight: allowedUserRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "600"
                    : "500",
                }}
              >
                <Space size={12}>
                  <FiUsers size={20} />
                  <span>Users</span>
                </Space>
                {residentsDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
              {residentsDropdownOpen && (
                <div
                  style={{
                    paddingLeft: "1rem",
                    marginLeft: "2rem",
                    borderLeft: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {allowedUserRoutes.map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        type="text"
                        className={`mobile-dropdown-link ${
                          isActive(route.path) ? "active" : ""
                        }`}
                        style={getMobileSublinkStyle(isActive(route.path))}
                      >
                        • {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              to={allowedUserRoutes[0].path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                type="text"
                className={`mobile-nav-link ${
                  isActive(allowedUserRoutes[0].path) ? "active" : ""
                }`}
                icon={<FiUsers size={20} />}
                style={getMobileButtonStyle(
                  isActive(allowedUserRoutes[0].path),
                )}
              >
                <span>{allowedUserRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </div>
      )}

      {hasPermission("/attendance") && (
        <Link to="/attendance" onClick={() => setMobileMenuOpen(false)}>
          <Button
            type="text"
            className={`mobile-nav-link ${isActive("/attendance") ? "active" : ""}`}
            icon={<HiOutlineCalendarDays size={20} />}
            style={getMobileButtonStyle(isActive("/attendance"))}
          >
            <span>Attendance</span>
          </Button>
        </Link>
      )}

      {hasPermission("/leave") && (
        <Link to="/leave" onClick={() => setMobileMenuOpen(false)}>
          <Button
            type="text"
            className={`mobile-nav-link ${isActive("/leave") ? "active" : ""}`}
            icon={<HiOutlineDocumentText size={20} />}
            style={getMobileButtonStyle(isActive("/leave"))}
          >
            <span>Leave</span>
          </Button>
        </Link>
      )}

      {hasPermission("/employees") && (
        <Link to="/employees" onClick={() => setMobileMenuOpen(false)}>
          <Button
            type="text"
            className={`mobile-nav-link ${isActive("/employees") ? "active" : ""}`}
            icon={<HiOutlineUserGroup size={20} />}
            style={getMobileButtonStyle(isActive("/employees"))}
          >
            <span>Employees</span>
          </Button>
        </Link>
      )}

      {allowedKitchenRoutes.length > 0 && (
        <div style={{display: "flex", flexDirection: "column"}}>
          {allowedKitchenRoutes.length > 1 ? (
            <>
              <Button
                type="text"
                onClick={() => setMessDropdownOpen(!messDropdownOpen)}
                className={`mobile-nav-link ${
                  allowedKitchenRoutes.some((route) => isActive(route.path))
                    ? "active"
                    : ""
                }`}
                style={{
                  color: "white",
                  width: "100%",
                  textAlign: "left",
                  justifyContent: "space-between",
                  padding: "1rem",
                  height: "auto",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: allowedKitchenRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent",
                  borderRadius: "6px",
                  fontWeight: allowedKitchenRoutes.some((route) =>
                    isActive(route.path),
                  )
                    ? "600"
                    : "500",
                }}
              >
                <Space size={12}>
                  <MdRestaurantMenu size={20} />
                  <span>Mess</span>
                </Space>
                {messDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
              {messDropdownOpen && (
                <div
                  style={{
                    paddingLeft: "1rem",
                    marginLeft: "2rem",
                    borderLeft: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {allowedKitchenRoutes.map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        type="text"
                        className={`mobile-dropdown-link ${
                          isActive(route.path) ? "active" : ""
                        }`}
                        style={getMobileSublinkStyle(isActive(route.path))}
                      >
                        • {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              to={allowedKitchenRoutes[0].path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                type="text"
                className={`mobile-nav-link ${
                  isActive(allowedKitchenRoutes[0].path) ? "active" : ""
                }`}
                icon={<MdRestaurantMenu size={20} />}
                style={getMobileButtonStyle(
                  isActive(allowedKitchenRoutes[0].path),
                )}
              >
                <span>{allowedKitchenRoutes[0].label}</span>
              </Button>
            </Link>
          )}
        </div>
      )}

      {hasPermission("/maintenance") && (
        <Link to="/maintenance" onClick={() => setMobileMenuOpen(false)}>
          <div style={{position: "relative", width: "100%"}}>
            <Button
              type="text"
              className={`mobile-nav-link ${isActive("/maintenance") ? "active" : ""}`}
              icon={<FiAlertCircle size={20} />}
              style={getMobileButtonStyle(isActive("/maintenance"))}
            >
              <span>Maintenance</span>
            </Button>
            {maintenanceCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#f5222d",
                  color: "white",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                {maintenanceCount}
              </span>
            )}
          </div>
        </Link>
      )}

      {(canViewAccounts || canViewAccounting) && (
        <div style={{display: "flex", flexDirection: "column"}}>
          {canViewAccounts && canViewAccounting ? (
            <>
              <Button
                type="text"
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className={`mobile-nav-link ${
                  isActive("/accounts") || isActive("/accounting")
                    ? "active"
                    : ""
                }`}
                style={{
                  color: "white",
                  width: "100%",
                  textAlign: "left",
                  justifyContent: "space-between",
                  padding: "1rem",
                  height: "auto",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    isActive("/accounts") || isActive("/accounting")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  borderRadius: "6px",
                  fontWeight:
                    isActive("/accounts") || isActive("/accounting")
                      ? "600"
                      : "500",
                }}
              >
                <Space size={12}>
                  <MdAccountBalance size={20} />
                  <span>Accounts</span>
                </Space>
                {accountsDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
              {accountsDropdownOpen && (
                <div
                  style={{
                    paddingLeft: "1rem",
                    marginLeft: "2rem",
                    borderLeft: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Link to="/accounts" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      type="text"
                      className={`mobile-dropdown-link ${
                        isActive("/accounts") ? "active" : ""
                      }`}
                      style={getMobileSublinkStyle(isActive("/accounts"))}
                    >
                      • Overview
                    </Button>
                  </Link>
                  <Link
                    to="/accounting"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      type="text"
                      className={`mobile-dropdown-link ${
                        isActive("/accounting") ? "active" : ""
                      }`}
                      style={getMobileSublinkStyle(isActive("/accounting"))}
                    >
                      • Accountant
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Link
              to={canViewAccounts ? "/accounts" : "/accounting"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                type="text"
                className={`mobile-nav-link ${
                  isActive("/accounts") || isActive("/accounting")
                    ? "active"
                    : ""
                }`}
                icon={<MdAccountBalance size={20} />}
                style={getMobileButtonStyle(
                  isActive("/accounts") || isActive("/accounting"),
                )}
              >
                <span>{canViewAccounts ? "Accounts" : "Accountant"}</span>
              </Button>
            </Link>
          )}
        </div>
      )}

      {hasPermission("/offboarding") && (
        <Link to="/offboarding" onClick={() => setMobileMenuOpen(false)}>
          <div style={{position: "relative", width: "100%"}}>
            <Button
              type="text"
              className={`mobile-nav-link ${isActive("/offboarding") ? "active" : ""}`}
              icon={<LuCircleArrowOutUpLeft size={18} />}
              style={getMobileButtonStyle(isActive("/offboarding"))}
            >
              <span>Off Boarding</span>
            </Button>
            {requestCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#f5222d",
                  color: "white",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                {requestCount}
              </span>
            )}
          </div>
        </Link>
      )}

      {hasPermission("/activity-logs") && (
        <div style={{display: "flex", flexDirection: "column"}}>
          <Button
            type="text"
            onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
            className={`mobile-nav-link ${isMoreActive() ? "active" : ""}`}
            style={{
              color: "white",
              width: "100%",
              textAlign: "left",
              justifyContent: "space-between",
              padding: "1rem",
              height: "auto",
              display: "flex",
              alignItems: "center",
              backgroundColor: isMoreActive()
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "6px",
              fontWeight: isMoreActive() ? "600" : "500",
            }}
          >
            <Space size={12}>
              <FaHistory size={18} />
              <span>More</span>
            </Space>
            {moreDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
          </Button>
          {moreDropdownOpen && (
            <div
              style={{
                paddingLeft: "1rem",
                marginLeft: "2rem",
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Link
                to="/activity-logs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  type="text"
                  className={`mobile-dropdown-link ${
                    isActive("/activity-logs") ? "active" : ""
                  }`}
                  style={getMobileSublinkStyle(isActive("/activity-logs"))}
                >
                  • Logs
                </Button>
              </Link>
              <Link to="/assets" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  type="text"
                  className={`mobile-dropdown-link ${
                    isActive("/assets") ? "active" : ""
                  }`}
                  style={getMobileSublinkStyle(isActive("/assets"))}
                >
                  • Assets
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Header
      style={{
        backgroundColor: "#059669",
        padding: 0,
        height: "auto",
        lineHeight: "normal",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.8rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
          <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "white",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  letterSpacing: "0.6px",
                }}
              >
                Hostel
                <span
                  style={{
                    fontWeight: 700,
                    WebkitTextStroke: "0.8px white",
                    color: "transparent",
                  }}
                >
                  X
                </span>
                pert
              </Text>
            </Link>
            <Text style={{color: "white", opacity: 0.5}}>|</Text>
            <Dropdown
              overlay={propertyMenu}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <Button
                type="text"
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  height: "auto",
                  fontWeight: 600,
                }}
              >
                <span style={{whiteSpace: "nowrap"}}>
                  {!selectedProperty?.id ||
                  selectedProperty.id === "null" ||
                  selectedProperty?.name === ""
                    ? `${user?.companyName}`
                    : selectedProperty?.name?.includes(
                          `${user?.companyName} - `,
                        ) && isMobile
                      ? selectedProperty.name.replace(
                          `${user?.companyName} - `,
                          "",
                        )
                      : selectedProperty?.name}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "16px",
                    width: "16px",
                  }}
                >
                  <FiChevronUp size={10} style={{marginBottom: "-2px"}} />
                  <FiChevronDown size={10} style={{marginTop: "-2px"}} />
                </span>
              </Button>
            </Dropdown>
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
          {/* Mobile Menu Toggle */}
          <Badge
            count={
              maintenanceCount > 0 || requestCount > 0 ? (
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#f5222d",
                    position: "absolute",
                    top: 0,
                    right: 0,
                  }}
                />
              ) : (
                0
              )
            }
            style={{boxShadow: "none"}}
          >
            <Button
              type="text"
              icon={<FiMenu size={24} style={{color: "white"}} />}
              onClick={toggleMobileMenu}
              className="menu-toggle"
              style={{display: isMobile ? "flex" : "none", color: "white"}}
            />
          </Badge>

          {/* Desktop Icons */}
          <Space size="middle" style={{display: isMobile ? "none" : "flex"}}>
            <Space size={4}>
              <Button
                type="text"
                icon={<FiUser size={20} style={{color: "white"}} />}
                className="icon-button"
                style={{color: "white", padding: "0.5rem", height: "auto"}}
              />
              <div style={{textAlign: "right"}}>
                <Space size={8}>
                  <Text style={{color: "white", fontWeight: 500}}>
                    {user?.name}
                  </Text>
                  <Badge
                    count={user?.role?.name}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontSize: "10px",
                      padding: "0 8px",
                      height: "20px",
                      lineHeight: "20px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                    }}
                  />
                </Space>
              </div>
            </Space>

            {settingsItems.length > 0 && (
              <Dropdown
                menu={{items: settingsItems, onClick: handleSettingsMenuClick}}
                trigger={["hover"]}
                placement="bottom"
              >
                <Button
                  type="text"
                  icon={<FiSliders size={20} style={{color: "white"}} />}
                  className="icon-button"
                  style={{color: "white", padding: "0.5rem", height: "auto"}}
                />
              </Dropdown>
            )}

            {notificationItems.length > 0 && (
              <Dropdown
                menu={{
                  items: notificationItems,
                  onClick: handleNotificationMenuClick,
                }}
                trigger={["hover"]}
                placement="bottom"
              >
                <Button
                  type="text"
                  icon={<FiBell size={20} style={{color: "white"}} />}
                  className="icon-button"
                  style={{color: "white", padding: "0.5rem", height: "auto"}}
                />
              </Dropdown>
            )}

            <Button
              type="text"
              icon={<FiLogOut size={20} style={{color: "white"}} />}
              onClick={handleLogoutClick}
              className="icon-button"
              style={{color: "white", padding: "0.5rem", height: "auto"}}
            />
          </Space>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div
        style={{
          display: isMobile ? "none" : "flex",
          justifyContent: "center",
          padding: "0.5rem 2rem",
          backgroundColor: "#059669",
        }}
      >
        {renderDesktopNavItems()}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        closable={false}
        onClose={toggleMobileMenu}
        open={mobileMenuOpen}
        width={320}
        bodyStyle={{padding: 0, backgroundColor: "#059669"}}
        headerStyle={{display: "none"}}
      >
        <div style={{padding: "1rem"}}>
          <Space
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "1rem 0",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "1rem",
            }}
          >
            <Button
              type="text"
              icon={<FiUser size={20} style={{color: "white"}} />}
              className="icon-button"
              style={{color: "white"}}
            />
            {settingsItems.length > 0 && (
              <Dropdown
                menu={{items: settingsItems, onClick: handleSettingsMenuClick}}
                trigger={["click"]}
                placement="bottom"
              >
                <Button
                  type="text"
                  icon={<FiSliders size={20} style={{color: "white"}} />}
                  className="icon-button"
                  style={{color: "white"}}
                />
              </Dropdown>
            )}
            {notificationItems.length > 0 && (
              <Dropdown
                menu={{
                  items: notificationItems,
                  onClick: handleNotificationMenuClick,
                }}
                trigger={["click"]}
                placement="bottom"
              >
                <Button
                  type="text"
                  icon={<FiBell size={20} style={{color: "white"}} />}
                  className="icon-button"
                  style={{color: "white"}}
                />
              </Dropdown>
            )}
            <Button
              type="text"
              icon={<FiLogOut size={20} style={{color: "white"}} />}
              onClick={handleLogoutClick}
              className="icon-button"
              style={{color: "white"}}
            />
          </Space>

          {renderMobileNavItems()}
        </div>
      </Drawer>

      {/* Modals */}
      <RefferalSettingsModal
        isOpen={isReferralSettingsModalOpen}
        onClose={() => setIsReferralSettingsModalOpen(false)}
      />
      <CarouselManagementModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
      />
      <GameManagementModal
        isOpen={isGameManagementModalOpen}
        onClose={() => setIsGameManagementModalOpen(false)}
      />
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogoutConfirm}
        onCancel={handleModalClose}
        className="mt-0"
      />
    </Header>
  );
};

export default Navbar;
