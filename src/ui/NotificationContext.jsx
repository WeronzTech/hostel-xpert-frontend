import {createContext, useState, useContext, useCallback} from "react";
import {FiCheckCircle, FiAlertCircle, FiInfo, FiX} from "react-icons/fi";

const NotificationContext = createContext();

export const NotificationProvider = ({children}) => {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback(
    (message, type = "info", duration = 3000) => {
      // Reset visibility state before showing new notification
      setIsVisible(false);
      setNotification({message, type});

      // Trigger animation on next tick
      setTimeout(() => {
        setIsVisible(true);

        if (duration) {
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setNotification(null), 300); // Wait for fade-out
          }, duration);
        }
      }, 10); // Small delay to allow state update
    },
    []
  );

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 300);
  }, []);

  return (
    <NotificationContext.Provider value={{showNotification, hideNotification}}>
      {children}
      {notification && (
        <div
          className={`fixed top-[14px] left-0 right-0 flex justify-center pointer-events-none z-[9999] transition-all duration-300 ease-in-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
          }`}
        >
          <div
            className={`flex items-center p-2 rounded-lg shadow-lg pointer-events-auto ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : notification.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <div className="mr-3">
              {notification.type === "success" ? (
                <FiCheckCircle className="text-green-500" size={20} />
              ) : notification.type === "error" ? (
                <FiAlertCircle className="text-red-500" size={20} />
              ) : (
                <FiInfo className="text-blue-500" size={20} />
              )}
            </div>
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={hideNotification}
              className="ml-4 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
