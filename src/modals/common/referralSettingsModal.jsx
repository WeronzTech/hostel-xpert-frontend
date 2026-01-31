import { useState, useEffect } from "react";
import { 
  FiBarChart2,
  FiSettings,
  FiAward,
  FiEdit,
  FiSave,
  FiX,
  FiPlus,
  FiTrendingUp
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getReferralSettings, updateReferralSettings } from "../../hooks/users/useUser";

const ReferralSettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("levels");
  const [referralSettings, setReferralSettings] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [tempLevelData, setTempLevelData] = useState({});
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({
    level: "",
    referralsNeeded: "",
    rewardAmount: ""
  });

  const queryClient = useQueryClient();

  // TanStack Query v5 for fetching referral settings
  const { 
    data: referralData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['referralSettings'],
    queryFn: getReferralSettings,
    enabled: isOpen,
    select: (response) => response.data
  });

  // Update local state when query data loads
  useEffect(() => {
    if (referralData) {
      setReferralSettings(referralData);
    }
  }, [referralData]);

  // TanStack Query v5 for mutation (update)
  const { mutate: updateSettings, isPending: saving } = useMutation({
    mutationFn: updateReferralSettings,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Settings saved successfully!", {
          position: "top-right",
        });
        // Invalidate and refetch the query to get fresh data
        queryClient.invalidateQueries({ queryKey: ['referralSettings'] });
      } else {
        toast.error(response.message || "Failed to save settings", {
          position: "top-right",
        });
      }
    },
    onError: (err) => {
      toast.error(`Failed to save settings: ${err.message}`, {
        position: "top-right",
      });
    }
  });

  const handleEditLevel = (level) => {
    setEditingLevel(level.level);
    setTempLevelData({ ...level });
  };

  const handleSaveLevel = () => {
    const updatedLevels = referralSettings.levels.map(level => 
      level.level === editingLevel ? { ...tempLevelData } : level
    );
    
    setReferralSettings({
      ...referralSettings,
      levels: updatedLevels
    });
    setEditingLevel(null);
    setTempLevelData({});
  };

  const handleCancelEdit = () => {
    setEditingLevel(null);
    setTempLevelData({});
  };

  const handleAddLevel = () => {
    const levelNumber = parseInt(newLevel.level);
    const referralsNeeded = parseInt(newLevel.referralsNeeded);
    const rewardAmount = parseInt(newLevel.rewardAmount);

    if (isNaN(levelNumber) || isNaN(referralsNeeded) || isNaN(rewardAmount)) {
      toast.warning("Please enter valid numbers for all fields", {
        position: "top-right",
      });
      return;
    }

    // Check if level already exists
    if (referralSettings.levels.some(level => level.level === levelNumber)) {
      toast.warning("Level already exists!", {
        position: "top-right",
      });
      return;
    }

    const updatedLevels = [
      ...referralSettings.levels,
      {
        level: levelNumber,
        referralsNeeded: referralsNeeded,
        rewardAmount: rewardAmount
      }
    ].sort((a, b) => a.level - b.level);

    setReferralSettings({
      ...referralSettings,
      levels: updatedLevels
    });
    setIsAddingLevel(false);
    setNewLevel({ level: "", referralsNeeded: "", rewardAmount: "" });
  };

  const handleInputChange = (field, value) => {
    setTempLevelData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewLevelChange = (field, value) => {
    setNewLevel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!referralSettings) return;

    updateSettings({
      levels: referralSettings.levels,
      maxUsagePerTransaction: referralSettings.maxUsagePerTransaction
    });
  };

  if (!isOpen) return null;

  // Centralized loading component
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-8 text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!referralSettings) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div 
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-xl border border-gray-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Referral Program Admin</h2>
              <p className="text-gray-300 mt-1">
                Manage referral program settings and levels
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Admin Tabs */}
          <div className="flex mt-6 space-x-1">
            {[
              { id: "levels", label: "Level Overview", icon: FiTrendingUp },
              { id: "settings", label: "Level Settings", icon: FiSettings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-gray-800"
                    : "text-gray-300 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Level Overview Tab */}
          {activeTab === "levels" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Level Overview</h3>
                <button
                  onClick={() => setIsAddingLevel(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Level
                </button>
              </div>

              {/* Add New Level Form */}
              {isAddingLevel && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Add New Level</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      placeholder="Level"
                      value={newLevel.level}
                      onChange={(e) => handleNewLevelChange("level", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Referrals Needed"
                      value={newLevel.referralsNeeded}
                      onChange={(e) => handleNewLevelChange("referralsNeeded", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Reward Amount"
                      value={newLevel.rewardAmount}
                      onChange={(e) => handleNewLevelChange("rewardAmount", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddLevel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <FiSave className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsAddingLevel(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Levels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referralSettings.levels.map((level) => (
                  <div
                    key={level.level}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiAward className="w-5 h-5 text-purple-600" />
                      </div>
                      {/* <div className="flex gap-1">
                        <button
                          onClick={() => handleEditLevel(level)}
                          className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                          title="Edit Level"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      </div> */}
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-900 mb-1">Level {level.level}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {level.referralsNeeded} referral{level.referralsNeeded !== 1 ? 's' : ''} needed
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ₹{level.rewardAmount}/referral
                    </div>
                  </div>
                ))}
              </div>

              {/* Level Progression Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Level Progression Chart</h4>
                <div className="space-y-4">
                  {referralSettings.levels.map((level, index) => (
                    <div key={level.level} className="flex items-center">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {level.level}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Level {level.level}</span>
                          <span className="text-green-600 font-semibold">₹{level.rewardAmount}/referral</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ 
                              width: `${(level.referralsNeeded / Math.max(...referralSettings.levels.map(l => l.referralsNeeded))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {level.referralsNeeded} referral{level.referralsNeeded !== 1 ? 's' : ''} required
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Level Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Level Reward Settings</h3>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referrals Needed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reward Amount (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referralSettings.levels.map((level) => (
                      <tr key={level.level} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLevel === level.level ? (
                            <input
                              type="number"
                              value={tempLevelData.level}
                              onChange={(e) => handleInputChange("level", parseInt(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="font-semibold">Level {level.level}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLevel === level.level ? (
                            <input
                              type="number"
                              value={tempLevelData.referralsNeeded}
                              onChange={(e) => handleInputChange("referralsNeeded", parseInt(e.target.value))}
                              className="w-32 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            level.referralsNeeded
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLevel === level.level ? (
                            <input
                              type="number"
                              value={tempLevelData.rewardAmount}
                              onChange={(e) => handleInputChange("rewardAmount", parseInt(e.target.value))}
                              className="w-32 px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            <span className="text-green-600 font-semibold">₹{level.rewardAmount}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingLevel === level.level ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveLevel}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1 cursor-pointer"
                              >
                                <FiSave className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                              >
                                <FiX className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditLevel(level)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              title="Edit Level"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Global Settings */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Global Program Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Usage Per Transaction (₹)
                    </label>
                    <input
                      type="number"
                      value={referralSettings.maxUsagePerTransaction}
                      onChange={(e) => setReferralSettings({
                        ...referralSettings,
                        maxUsagePerTransaction: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Status
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer">
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Admin Panel • Make sure to save your changes
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSettingsModal;