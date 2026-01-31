import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { checkTokenExpiration, logout } from "../redux/authSlice.js";
import SessionExpiredModal from "../modals/common/SessionExpiredModal.jsx";

const AuthRouteValidator = ({ children }) => {
  const { showExpirationModal } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(checkTokenExpiration());
  }, [location.pathname, dispatch]);

  const handleModalClose = () => {
    dispatch(logout({ showModal: false }));
    navigate("/login", { state: { expired: true } });
  };

  return (
    <>
      {showExpirationModal && (
        <SessionExpiredModal onClose={handleModalClose} />
      )}
      {children}
    </>
  );
};

export default AuthRouteValidator;
