import {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Navigate, useLocation} from "react-router-dom";
import {initializeAuth, checkTokenExpiration} from "../redux/authSlice.js";
import LoadingSpinner from "../ui/loadingSpinner/LoadingSpinner.jsx";

const ProtectedRoute = ({children}) => {
  const {isAuthenticated, initialized, showExpirationModal} = useSelector(
    (state) => state.auth,
  );
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
    }
    dispatch(checkTokenExpiration());
  }, [dispatch, initialized]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  // Don't redirect if showing expiration modal
  if (!isAuthenticated && !showExpirationModal) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return children;
};

export default ProtectedRoute;
