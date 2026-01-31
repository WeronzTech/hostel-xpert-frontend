import "react-toastify/dist/ReactToastify.css";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {initializeAuth} from "./redux/authSlice";
import SessionExpiredModal from "./modals/common/SessionExpiredModal";

function App() {
  const dispatch = useDispatch();
  const {showExpirationModal} = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      {showExpirationModal && <SessionExpiredModal />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
