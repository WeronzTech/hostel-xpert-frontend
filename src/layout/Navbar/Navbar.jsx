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
import "./Navbar.css";
import {useState, useEffect, useMemo} from "react";
import ConfirmModal from "../../modals/common/ConfirmModal";
import {logout} from "../../redux/authSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {getAllHeavensProperties} from "../../hooks/property/useProperty.js";
import {selectProperty, setProperties} from "../../redux/propertiesSlice.js";
import {Dropdown, Menu} from "antd";
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

const Navbar = () => {
  const {user} = useSelector((state) => state.auth);
  console.log(user);
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [isReferralSettingsModalOpen, setIsReferralSettingsModalOpen] =
    useState(false);
  const [isGameManagementModalOpen, setIsGameManagementModalOpen] =
    useState(false);

  const roleId = useSelector((state) => state?.auth?.user?.role?.id);

  const {data: role} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
  });

  const permissions = role?.permissions;

  const hasPermission = (requiredPermission) => {
    // Allow everything if user has ALL_PRIVILEGES
    if (permissions?.includes("ALL_PRIVILEGES")) {
      return true;
    }

    return permissions?.includes(requiredPermission);
  };

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [residentsDropdownOpen, setResidentsDropdownOpen] = useState(false);
  const [messDropdownOpen, setMessDropdownOpen] = useState(false);
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false); // <-- CHANGED from logsDropdownOpen
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Close mobile menu when any modal opens
  useEffect(() => {
    if (
      isCarouselModalOpen ||
      isReferralSettingsModalOpen ||
      isGameManagementModalOpen ||
      isLogoutModalOpen
    ) {
      setMenuOpen(false);
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
  };

  const handleSettingsMenuClick = ({key}) => {
    // Close mobile menu when settings option is clicked
    if (isMobile) {
      setMenuOpen(false);
    }

    if (key === "1") handleCarouselClick();
    else if (key === "2") handleRefferalClick();
    else if (key === "3") handleGameManagementClick();
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

  // Close all dropdowns when menu is toggled
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      // When opening menu, close all dropdowns
      setPropertyDropdownOpen(false);
      setResidentsDropdownOpen(false);
      setMessDropdownOpen(false);
      setMoreDropdownOpen(false); // <-- CHANGED from setLogsDropdownOpen
    }
  };

  const togglePropertyDropdown = () =>
    setPropertyDropdownOpen(!propertyDropdownOpen);

  const toggleAccountsDropdown = () =>
    setAccountsDropdownOpen(!accountsDropdownOpen);

  const toggleResidentsDropdown = () =>
    setResidentsDropdownOpen(!residentsDropdownOpen);

  const toggleMessDropdown = () => setMessDropdownOpen(!messDropdownOpen);

  const toggleMoreDropdown = () => setMoreDropdownOpen(!moreDropdownOpen); // <-- CHANGED from toggleLogsDropdown

  const items = [
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

  const settings = [
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
    {
      path: "/monthlyRent",
      label: "Monthly Rent",
      permission: "/monthlyRent",
    },
    {
      path: "/dailyRent",
      label: "Daily Rent",
      permission: "/dailyRent",
    },
    {
      path: "/food-only",
      label: "Mess Only",
      permission: "/food-only",
    },
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
    {
      path: "/property",
      label: "Properties",
      canView: canViewProperties,
    },
    {
      path: "/floor",
      label: "Floors",
      canView: canViewFloors,
    },
    {
      path: "/rooms",
      label: "Rooms",
      canView: canViewRooms,
    },
  ];

  const kitchenRoutes = [
    {
      path: "/mess",
      label: "Order Details",
      canView: canViewOrderDetails,
    },
    {
      path: "/kitchen",
      label: "Kitchen",
      canView: canViewKitchens,
    },
    {
      path: "/stock-usage",
      label: "Daily Usage",
      canView: canViewDailyUsage,
    },
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
        console.log(data);
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
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  // <-- CHANGED: Updated isMoreActive to check for new paths
  const isMoreActive = () => {
    return isActive("/activity-logs") || isActive("/assets");
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setMenuOpen(false);
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

  // Close mobile menu when navigating
  const handleMobileLinkClick = () => {
    setMenuOpen(false);
  };

  const maintenanceCount = useMaintenanceCount();
  const requestCount = useRequestCount();

  return (
    <header className="navbar">
      {/* First Row */}
      <div className="navbar-top">
        <div className="navbar-left">
          <div className="logo" style={{display: "flex", alignItems: "center"}}>
            <Link
              to="/"
              className="logo-link"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span className="logo-text">HostelXpert</span>
            </Link>
            <span className="separator">|</span>
            <Dropdown
              overlay={
                <div className="property-dropdown-container min-w-[300px] max-h-[400px] overflow-y-auto">
                  {/* <Input
                    placeholder="Search property..."
                    prefix={<FiSearch size={14} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                    onClick={(e) => e.stopPropagation()}
                  /> */}

                  <Menu className="border-0">
                    {filteredList.map((property) => {
                      const isSelected =
                        (!selectedProperty?.id &&
                          property.name === "All Properties") ||
                        selectedProperty?.id === property._id;

                      return (
                        <Menu.Item
                          key={property._id || property.name}
                          className={`${
                            isSelected ? "bg-purple-50 text-[#059669]" : ""
                          } `}
                          onClick={(e) => {
                            e.domEvent.stopPropagation();
                            handlePropertySelect(property);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{property.name}</span>
                            {isSelected && (
                              <span className="text-[#059669]">✓</span>
                            )}
                          </div>
                        </Menu.Item>
                      );
                    })}

                    {filteredList.length === 0 && (
                      <Menu.Item disabled className="text-center text-gray-500">
                        No properties found
                      </Menu.Item>
                    )}
                  </Menu>
                </div>
              }
              trigger={["click"]}
              placement="bottomLeft"
              overlayClassName="property-dropdown-antd"
              onOpenChange={(open) => {
                if (!open) {
                  setSearchTerm(""); // Clear search when dropdown closes
                }
              }}
            >
              <div className="property-selector-antd cursor-pointer flex items-center gap-1 px-2 md:px-0 py-1 rounded min-w-0">
                {/* Remove max-w-[200px] and truncate classes here */}
                <span className="property-text whitespace-nowrap">
                  {!selectedProperty?.id ||
                  selectedProperty.id === "null" ||
                  selectedProperty?.name === ""
                    ? `${user.companyName}`
                    : selectedProperty?.name?.includes(
                          `${user.companyName} - `,
                        ) && isMobile
                      ? selectedProperty.name.replace(
                          `${user.companyName} - `,
                          "",
                        )
                      : selectedProperty?.name}
                </span>
                <span className="sort-icons flex flex-col flex-shrink-0">
                  <FiChevronUp size={10} className="-mb-1" />
                  <FiChevronDown size={10} className="-mt-1" />
                </span>
              </div>
            </Dropdown>
          </div>
        </div>

        <div className="navbar-right">
          <button className="menu-toggle relative" onClick={toggleMenu}>
            <FiMenu size={24} className="text-white" />
            {(maintenanceCount > 0 || requestCount > 0) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <div className="icons-desktop flex items-center gap-4">
            <div className="user-info flex items-center gap-2">
              <button className="icon-button p-1 rounded-full hover:bg-[#3a32a1]">
                <FiUser size={20} className="text-white" />
              </button>

              <div className="text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium text-white">{user?.name}</span>

                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full
                        bg-white/20 text-white
                       uppercase tracking-wide"
                  >
                    {user?.role?.name}
                  </span>
                </div>
              </div>
            </div>

            {settings.length > 0 && (
              <Dropdown
                menu={{items: settings, onClick: handleSettingsMenuClick}}
                trigger={["hover"]}
                placement="bottom"
                arrow
              >
                <button className="icon-button p-1 rounded-full hover:bg-[#3a32a1]">
                  <FiSliders size={20} className="text-white" />
                </button>
              </Dropdown>
            )}

            {items.length > 0 && (
              <Dropdown
                menu={{items, onClick: handleNotificationMenuClick}}
                trigger={["hover"]}
                placement="bottom"
                arrow
              >
                <button className="icon-button p-1 rounded-full hover:bg-[#3a32a1]">
                  <FiBell size={20} className="text-white" />
                </button>
              </Dropdown>
            )}

            <button
              className="icon-button p-1 rounded-full hover:bg-[#3a32a1]"
              onClick={handleLogoutClick}
            >
              <FiLogOut size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slides from right */}
      <div className={`mobile-menu-container ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-overlay" onClick={toggleMenu}></div>
        <div className="mobile-menu-content">
          <div className="mobile-menu-icons">
            <button className="icon-button">
              <FiUser size={20} />
            </button>
            <Dropdown
              menu={{items: settings, onClick: handleSettingsMenuClick}}
              trigger={["click"]}
              placement="bottom"
              arrow
            >
              <button className="icon-button">
                <FiSliders size={20} />
              </button>
            </Dropdown>
            <Dropdown
              menu={{items, onClick: handleNotificationMenuClick}}
              trigger={["click"]}
              placement="bottom"
              arrow
            >
              <button className="icon-button">
                <FiBell size={20} />
              </button>
            </Dropdown>
            <button className="icon-button" onClick={handleLogoutClick}>
              <FiLogOut size={20} />
            </button>
          </div>
          <nav className="mobile-nav-items">
            {hasPermission("/") && (
              <Link
                to="/"
                className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
                onClick={handleMobileLinkClick}
              >
                <FiGrid size={20} />
                <span>Dashboard</span>
              </Link>
            )}

            {allowedPropertyRoutes.length > 0 && (
              <>
                {/* MULTIPLE permissions → dropdown */}
                {allowedPropertyRoutes.length > 1 ? (
                  <div className="mobile-dropdown-container">
                    <div
                      className={`mobile-nav-link ${
                        allowedPropertyRoutes.some((route) =>
                          isActive(route.path),
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={togglePropertyDropdown}
                    >
                      <FiHome size={20} />
                      <span>Property</span>
                      {propertyDropdownOpen ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>

                    {propertyDropdownOpen && (
                      <div className="mobile-dropdown-menu">
                        {allowedPropertyRoutes.map((route) => (
                          <Link
                            key={route.path}
                            to={route.path}
                            className={`mobile-dropdown-link ${
                              isActive(route.path) ? "active" : ""
                            }`}
                            onClick={handleMobileLinkClick}
                          >
                            {route.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SINGLE permission → direct link */
                  <Link
                    to={allowedPropertyRoutes[0].path}
                    className={`mobile-nav-link ${
                      isActive(allowedPropertyRoutes[0].path) ? "active" : ""
                    }`}
                    onClick={handleMobileLinkClick}
                  >
                    <FiHome size={20} />
                    <span>{allowedPropertyRoutes[0].label}</span>
                  </Link>
                )}
              </>
            )}

            {allowedUserRoutes.length > 0 && (
              <>
                {/* MULTIPLE routes → dropdown */}
                {allowedUserRoutes.length > 1 ? (
                  <div className="mobile-dropdown-container">
                    <div
                      className={`mobile-nav-link ${
                        allowedUserRoutes.some((route) => isActive(route.path))
                          ? "active"
                          : ""
                      }`}
                      onClick={toggleResidentsDropdown}
                    >
                      <FiUsers size={20} />
                      <span>Users</span>
                      {residentsDropdownOpen ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>

                    {residentsDropdownOpen && (
                      <div className="mobile-dropdown-menu">
                        {allowedUserRoutes.map((route) => (
                          <Link
                            key={route.path}
                            to={route.path}
                            className={`mobile-dropdown-link ${
                              isActive(route.path) ? "active" : ""
                            }`}
                            onClick={handleMobileLinkClick}
                          >
                            {route.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SINGLE route → direct link */
                  <Link
                    to={allowedUserRoutes[0].path}
                    className={`mobile-nav-link ${
                      isActive(allowedUserRoutes[0].path) ? "active" : ""
                    }`}
                    onClick={handleMobileLinkClick}
                  >
                    <div className="flex items-center gap-2">
                      <FiUsers size={20} />
                      <span>{allowedUserRoutes[0].label}</span>
                    </div>
                  </Link>
                )}
              </>
            )}

            {hasPermission("/employees") && (
              <Link
                to="/employees"
                className={`mobile-nav-link ${
                  isActive("/employees") ? "active" : ""
                }`}
                onClick={handleMobileLinkClick}
              >
                <HiOutlineUserGroup size={20} />
                <span>Employees</span>
              </Link>
            )}
            {allowedKitchenRoutes.length > 0 && (
              <>
                {/* MULTIPLE permissions → dropdown */}
                {allowedKitchenRoutes.length > 1 ? (
                  <div className="mobile-dropdown-container">
                    <div
                      className={`mobile-nav-link ${
                        allowedKitchenRoutes.some((route) =>
                          isActive(route.path),
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={toggleMessDropdown}
                    >
                      <MdRestaurantMenu size={20} />
                      <span>Mess</span>
                      {messDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>

                    {messDropdownOpen && (
                      <div className="mobile-dropdown-menu">
                        {allowedKitchenRoutes.map((route) => (
                          <Link
                            key={route.path}
                            to={route.path}
                            className={`mobile-dropdown-link ${
                              isActive(route.path) ? "active" : ""
                            }`}
                            onClick={handleMobileLinkClick}
                          >
                            {route.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SINGLE permission → direct link */
                  <Link
                    to={allowedKitchenRoutes[0].path}
                    className={`mobile-nav-link ${
                      isActive(allowedKitchenRoutes[0].path) ? "active" : ""
                    }`}
                    onClick={handleMobileLinkClick}
                  >
                    <MdRestaurantMenu size={20} />
                    <span>{allowedKitchenRoutes[0].label}</span>
                  </Link>
                )}
              </>
            )}

            {hasPermission("/maintenance") && (
              <Link
                to="/maintenance"
                className={`mobile-nav-link ${
                  isActive("/maintenance") ? "active" : ""
                } relative`}
                onClick={handleMobileLinkClick}
              >
                <FiAlertCircle size={20} />
                <span>Maintenance</span>
                <MaintenanceCountBadge
                  count={maintenanceCount}
                  className="mobile-badge"
                />
              </Link>
            )}

            {(canViewAccounts || canViewAccounting) && (
              <>
                {/* BOTH permissions → show dropdown */}
                {canViewAccounts && canViewAccounting ? (
                  <div className="mobile-dropdown-container">
                    <div
                      className={`mobile-nav-link ${
                        isActive("/accounts") || isActive("/accounting")
                          ? "active"
                          : ""
                      }`}
                      onClick={toggleAccountsDropdown}
                    >
                      <MdAccountBalance size={20} />
                      <span>Accounts</span>
                      {accountsDropdownOpen ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>

                    {accountsDropdownOpen && (
                      <div className="mobile-dropdown-menu">
                        <Link
                          to="/accounts"
                          className={`mobile-dropdown-link ${
                            isActive("/accounts") ? "active" : ""
                          }`}
                          onClick={handleMobileLinkClick}
                        >
                          Overview
                        </Link>

                        <Link
                          to="/accounting"
                          className={`mobile-dropdown-link ${
                            isActive("/accounting") ? "active" : ""
                          }`}
                          onClick={handleMobileLinkClick}
                        >
                          Accountant
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ONLY ONE permission → show direct link */
                  <Link
                    to={canViewAccounts ? "/accounts" : "/accounting"}
                    className={`mobile-nav-link ${
                      isActive("/accounts") || isActive("/accounting")
                        ? "active"
                        : ""
                    }`}
                    onClick={handleMobileLinkClick}
                  >
                    <MdAccountBalance size={20} />
                    <span>{canViewAccounts ? "Accounts" : "Accountant"}</span>
                  </Link>
                )}
              </>
            )}

            {hasPermission("/offboarding") && (
              <Link
                to="/offboarding"
                className={`mobile-nav-link ${
                  isActive("/offboarding") ? "active" : ""
                } relative`}
                onClick={handleMobileLinkClick}
              >
                <LuCircleArrowOutUpLeft size={20} />
                <span>Off Boarding</span>
                <RequestCountBadge
                  count={requestCount}
                  className="mobile-badge"
                />
              </Link>
            )}
            {/* // <-- ENTIRE 'MORE' BLOCK CHANGED --> */}
            {hasPermission("/activity-logs") && (
              <div className="mobile-dropdown-container">
                <div
                  className={`mobile-nav-link ${
                    isMoreActive() ? "active" : "" // <-- CHANGED
                  }`}
                  onClick={toggleMoreDropdown} // <-- CHANGED
                >
                  <FaHistory size={18} />
                  <span>More</span> {/* // <-- CHANGED */}
                  {moreDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                  {/* // <-- CHANGED */}
                </div>
                {moreDropdownOpen && ( // <-- CHANGED
                  <div className="mobile-dropdown-menu">
                    <Link
                      to="/activity-logs"
                      className={`mobile-dropdown-link ${
                        isActive("/activity-logs") ? "active" : ""
                      }`}
                      onClick={handleMobileLinkClick}
                    >
                      <span>Logs</span> {/* // <-- CHANGED */}
                    </Link>
                    <Link
                      to="/assets" // <-- CHANGED
                      className={`mobile-dropdown-link ${
                        isActive("/assets") ? "active" : "" // <-- CHANGED
                      }`}
                      onClick={handleMobileLinkClick}
                    >
                      <span>Assets</span> {/* // <-- CHANGED */}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Second Row - Nav Links */}
      <div className={`navbar-bottom ${menuOpen ? "open" : ""}`}>
        <nav className="nav-items">
          {hasPermission("/") && (
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <div className="nav-icon-text">
                <FiGrid size={20} />
                <span>Dashboard</span>
              </div>
            </Link>
          )}

          {allowedPropertyRoutes.length > 0 && (
            <>
              {/* MULTIPLE permissions → dropdown */}
              {allowedPropertyRoutes.length > 1 ? (
                <div
                  className={`nav-link dropdown-container ${
                    allowedPropertyRoutes.some((route) => isActive(route.path))
                      ? "active"
                      : ""
                  }`}
                  onMouseEnter={() => setPropertyDropdownOpen(true)}
                  onMouseLeave={() => setPropertyDropdownOpen(false)}
                >
                  <div className="nav-icon-text">
                    <FiHome size={20} />
                    <span>Property</span>
                    {propertyDropdownOpen ? (
                      <FiChevronUp size={16} />
                    ) : (
                      <FiChevronDown size={16} />
                    )}
                  </div>

                  {propertyDropdownOpen && (
                    <div className="dropdown-menu">
                      {allowedPropertyRoutes.map((route) => (
                        <Link
                          key={route.path}
                          to={route.path}
                          className={`dropdown-link ${
                            isActive(route.path) ? "active" : ""
                          }`}
                        >
                          {route.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* SINGLE permission → direct link */
                <Link
                  to={allowedPropertyRoutes[0].path}
                  className={`nav-link ${
                    isActive(allowedPropertyRoutes[0].path) ? "active" : ""
                  }`}
                >
                  <div className="nav-icon-text">
                    <FiHome size={20} />
                    <span>{allowedPropertyRoutes[0].label}</span>
                  </div>
                </Link>
              )}
            </>
          )}

          {allowedUserRoutes.length > 0 && (
            <>
              {/* MULTIPLE routes → dropdown */}
              {allowedUserRoutes.length > 1 ? (
                <div
                  className={`nav-link dropdown-container ${
                    allowedUserRoutes.some((route) => isActive(route.path))
                      ? "active"
                      : ""
                  }`}
                  onMouseEnter={() => setResidentsDropdownOpen(true)}
                  onMouseLeave={() => setResidentsDropdownOpen(false)}
                >
                  <div className="nav-icon-text">
                    <FiUsers size={20} />
                    <span>Users</span>
                    {residentsDropdownOpen ? (
                      <FiChevronUp size={16} />
                    ) : (
                      <FiChevronDown size={16} />
                    )}
                  </div>

                  {residentsDropdownOpen && (
                    <div className="dropdown-menu">
                      {allowedUserRoutes.map((route) => (
                        <Link
                          key={route.path}
                          to={route.path}
                          className={`dropdown-link ${
                            isActive(route.path) ? "active" : ""
                          }`}
                        >
                          {route.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* SINGLE route → direct link */
                <Link
                  to={allowedUserRoutes[0].path}
                  className={`nav-link ${
                    isActive(allowedUserRoutes[0].path) ? "active" : ""
                  }`}
                >
                  <div className="nav-icon-text">
                    <FiUsers size={20} />
                    <span>{allowedUserRoutes[0].label}</span>
                  </div>
                </Link>
              )}
            </>
          )}

          {hasPermission("/employees") && (
            <Link
              to="/employees"
              className={`nav-link ${isActive("/employees") ? "active" : ""}`}
            >
              <div className="nav-icon-text">
                <HiOutlineUserGroup size={20} />
                <span>Employees</span>
              </div>
            </Link>
          )}

          {allowedKitchenRoutes.length > 0 && (
            <>
              {/* MULTIPLE permissions → dropdown */}
              {allowedKitchenRoutes.length > 1 ? (
                <div
                  className={`nav-link dropdown-container ${
                    allowedKitchenRoutes.some((route) => isActive(route.path))
                      ? "active"
                      : ""
                  }`}
                  onMouseEnter={() => setMessDropdownOpen(true)}
                  onMouseLeave={() => setMessDropdownOpen(false)}
                >
                  <div className="nav-icon-text">
                    <MdRestaurantMenu size={20} />
                    <span>Mess</span>
                    {messDropdownOpen ? (
                      <FiChevronUp size={16} />
                    ) : (
                      <FiChevronDown size={16} />
                    )}
                  </div>

                  {messDropdownOpen && (
                    <div className="dropdown-menu">
                      {allowedKitchenRoutes.map((route) => (
                        <Link
                          key={route.path}
                          to={route.path}
                          className={`dropdown-link ${
                            isActive(route.path) ? "active" : ""
                          }`}
                        >
                          {route.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* SINGLE permission → direct link */
                <Link
                  to={allowedKitchenRoutes[0].path}
                  className={`nav-link ${
                    isActive(allowedKitchenRoutes[0].path) ? "active" : ""
                  }`}
                >
                  <div className="nav-icon-text">
                    <MdRestaurantMenu size={20} />
                    <span>{allowedKitchenRoutes[0].label}</span>
                  </div>
                </Link>
              )}
            </>
          )}

          {hasPermission("/maintenance") && (
            <Link
              to="/maintenance"
              className={`nav-link ${
                isActive("/maintenance") ? "active" : ""
              } relative group`}
            >
              <div className="nav-icon-text">
                <FiAlertCircle size={20} />
                <span>Maintenance</span>
                <MaintenanceCountBadge
                  count={maintenanceCount}
                  className="absolute -top-1 -right-3 group-hover:scale-110 transition-all"
                />
              </div>
            </Link>
          )}

          {(canViewAccounts || canViewAccounting) && (
            <>
              {canViewAccounts && canViewAccounting ? (
                <div
                  className={`nav-link dropdown-container ${
                    isActive("/accounts") || isActive("/accounting")
                      ? "active"
                      : ""
                  }`}
                  onMouseEnter={() => setAccountsDropdownOpen(true)}
                  onMouseLeave={() => setAccountsDropdownOpen(false)}
                >
                  <div className="nav-icon-text">
                    <MdAccountBalance size={20} />
                    <span>Accounts</span>
                    {accountsDropdownOpen ? (
                      <FiChevronUp size={16} />
                    ) : (
                      <FiChevronDown size={16} />
                    )}
                  </div>

                  {accountsDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link
                        to="/accounts"
                        className={`dropdown-link ${
                          isActive("/accounts") ? "active" : ""
                        }`}
                      >
                        Overview
                      </Link>

                      <Link
                        to="/accounting"
                        className={`dropdown-link ${
                          isActive("/accounting") ? "active" : ""
                        }`}
                      >
                        Accountant
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* ONLY ONE permission → direct link (desktop-sized) */
                <Link
                  to={canViewAccounts ? "/accounts" : "/accounting"}
                  className={`nav-link ${
                    isActive("/accounts") || isActive("/accounting")
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="nav-icon-text">
                    <MdAccountBalance size={20} />
                    <span>{canViewAccounts ? "Accounts" : "Accountant"}</span>
                  </div>
                </Link>
              )}
            </>
          )}

          {hasPermission("/offboarding") && (
            <Link
              to="/offboarding"
              className={`nav-link ${
                isActive("/offboarding") ? "active" : ""
              } relative group`}
            >
              <div className="nav-icon-text">
                <LuCircleArrowOutUpLeft size={18} />
                <span>Off Boarding</span>

                <RequestCountBadge
                  count={requestCount}
                  className="absolute -top-1 -right-3 group-hover:scale-110 transition-all"
                />
              </div>
            </Link>
          )}

          {/* // <-- ENTIRE 'MORE' BLOCK CHANGED --> */}
          {hasPermission("/activity-logs") && (
            <div
              className={`nav-link dropdown-container ${
                isMoreActive() ? "active" : "" // <-- CHANGED
              }`}
              onMouseEnter={() => setMoreDropdownOpen(true)} // <-- CHANGED
              onMouseLeave={() => setMoreDropdownOpen(false)} // <-- CHANGED
            >
              <div className="nav-icon-text">
                <FaHistory size={18} />
                <span>More</span> {/* // <-- CHANGED */}
                {moreDropdownOpen ? ( // <-- CHANGED
                  <FiChevronUp size={16} />
                ) : (
                  <FiChevronDown size={16} />
                )}
              </div>
              {moreDropdownOpen && ( // <-- CHANGED
                <div className="dropdown-menu">
                  <Link
                    to="/activity-logs"
                    className={`dropdown-link ${
                      isActive("/activity-logs") ? "active" : ""
                    }`}
                  >
                    <span>Logs</span> {/* // <-- CHANGED */}
                  </Link>
                  <Link
                    to="/assets" // <-- CHANGED
                    className={`dropdown-link ${
                      isActive("/assets") ? "active" : "" // <-- CHANGED
                    }`}
                  >
                    <span>Assets</span> {/* // <-- CHANGED */}
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

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
    </header>
  );
};

export default Navbar;
