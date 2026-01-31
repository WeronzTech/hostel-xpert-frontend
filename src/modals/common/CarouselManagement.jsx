import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiEdit, FiTrash2, FiImage, FiLoader, FiEye } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { addCarousel, updateCarousel, deleteCarousel, getAllCarousel } from '../../hooks/property/useProperty.js';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import { Image, message } from 'antd';

// Query keys for caching
const carouselKeys = {
  all: ['carousels'],
  lists: () => [...carouselKeys.all, 'list'],
  list: (filters) => [...carouselKeys.lists(), { filters }],
  details: () => [...carouselKeys.all, 'detail'],
  detail: (id) => [...carouselKeys.details(), id],
};

const CarouselManagementModal = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedProperty } = useSelector((state) => state.properties);
  const queryClient = useQueryClient();
  
  // TanStack Query hooks
  const { data: carouselsData, isLoading, error } = useQuery({
    queryKey: carouselKeys.lists(),
    queryFn: getAllCarousel,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isOpen,
  });

  const addMutation = useMutation({
    mutationFn: addCarousel,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: carouselKeys.lists(),
        exact: false 
      });
      message.success('Carousel added successfully!');
    },
    onError: (error) => {
      console.error('Add carousel error:', error);
      message.error(error.message || 'Failed to add carousel');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ data, carouselId }) => updateCarousel(data, carouselId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(carouselKeys.detail(variables.carouselId), data);
      queryClient.invalidateQueries({ 
        queryKey: carouselKeys.lists(),
        exact: false 
      });
      message.success('Carousel updated successfully!');
    },
    onError: (error) => {
      console.error('Update carousel error:', error);
      message.error(error.message || 'Failed to update carousel');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarousel,
    onSuccess: (_, carouselId) => {
      queryClient.removeQueries({ queryKey: carouselKeys.detail(carouselId) });
      queryClient.invalidateQueries({ 
        queryKey: carouselKeys.lists(),
        exact: false 
      });
      message.success('Carousel deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete carousel error:', error);
      message.error(error.message || 'Failed to delete carousel');
    }
  });

  const [carouselData, setCarouselData] = useState({
    title: '',
    image: null,
    imagePreview: null
  });
  
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const carouselItems = carouselsData?.data || [];

  // Define mutation states here, before they're used in functions
  const isSubmitting = addMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarouselData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setCarouselData(prev => ({
          ...prev,
          image: file,
          imagePreview: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!carouselData.title.trim()) {
      message.error('Please enter a title for the carousel');
      return;
    }

    if (!carouselData.image && !editingId) {
      message.error('Please select an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', carouselData.title.trim());
      
      // Always append file if available, for both create and update
      if (carouselData.image) {
        formData.append('file', carouselData.image);
      }
      
      // Append required fields for backend
      if (selectedProperty?.id) {
        formData.append('propertyId', selectedProperty.id);
      }
      formData.append('userId', user.id);

      if (editingId) {
        // Update existing carousel
        await updateMutation.mutateAsync({ 
          data: formData, 
          carouselId: editingId 
        });
      } else {
        // Add new carousel
        await addMutation.mutateAsync(formData);
      }

      // Reset form on success
      resetForm();
      
    } catch (error) {
      console.error('Operation failed:', error);
      // Error is handled by mutation onError
    }
  };

  const handleEdit = (item) => {
    setCarouselData({
      title: item.title,
      image: null,
      imagePreview: item.image
    });
    setEditingId(item._id || item.id);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      // Error is handled by mutation onError
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setCarouselData({
      title: '',
      image: null,
      imagePreview: null
    });
    setEditingId(null);
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0  bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-transform duration-300 scale-100"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-600 to-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {editingId ? 'Edit Carousel Item' : 'Manage Carousel'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {selectedProperty?.name ? `Property: ${selectedProperty.name}` : 'All Properties'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              disabled={isSubmitting}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="overflow-auto max-h-[calc(90vh-140px)]">
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <FiLoader className="animate-spin text-[#4d44b5]" size={32} />
                <span className="ml-3 text-gray-600">Loading carousels...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg m-4 p-4">
                <p className="text-red-700">Error loading carousels: {error.message}</p>
              </div>
            )}

            {/* Form Section */}
            {!isLoading && (
              <div className="p-6 border-b border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carousel Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={carouselData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive title for your carousel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d44b5] focus:border-transparent transition-all"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carousel Image {!editingId && '*'}
                    </label>
                    <div className="space-y-4">
                      <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4d44b5] hover:bg-gray-50 transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="text-center">
                          <FiUpload className="text-gray-400 mb-3 mx-auto" size={32} />
                          <p className="text-gray-600 font-medium">Click to upload image</p>
                          <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                      </label>

                      {carouselData.imagePreview && (
                        <div className="relative bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">Image Preview:</p>
                          <div className="relative inline-block">
                            <Image
                              src={carouselData.imagePreview}
                              alt="Preview"
                              width={200}
                              height={160}
                              style={{ 
                                objectFit: 'cover', 
                                borderRadius: 8,
                                border: '2px solid #4d44b5'
                              }}
                              preview={{
                                mask: (
                                  <div className="flex items-center justify-center">
                                    <FiEye className="mr-2" />
                                    Click to preview
                                  </div>
                                )
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setCarouselData(prev => ({ ...prev, imagePreview: null, image: null }))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              disabled={isSubmitting}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                     className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting && <FiLoader className="animate-spin mr-2" size={18} />}
                      {editingId ? 'Update Item' : 'Add to Carousel'}
                    </button>
                    
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Carousel Items List */}
            {!isLoading && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Carousel Items
                  </h3>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {carouselItems.length} items
                  </span>
                </div>
                
                {/* Rectangular Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carouselItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      {/* Image Section */}
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width="100%"
                          height="100%"
                          style={{ 
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }}
                          preview={{
                            mask: (
                              <div className="flex items-center justify-center text-white">
                                <FiEye className="mr-2" />
                                Click to preview
                              </div>
                            )
                          }}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        {/* Action Buttons Overlay */}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={isSubmitting || isDeleting}
                            className="p-2 bg-white bg-opacity-90 text-[#4d44b5] hover:bg-[#4d44b5] hover:text-white rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={isSubmitting || isDeleting}
                            className="p-2 bg-white bg-opacity-90 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 flex items-center justify-center"
                            title="Delete"
                          >
                            {deleteMutation.variables === item._id && deleteMutation.isPending ? (
                              <FiLoader className="animate-spin" size={16} />
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          {item.updatedAt && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Updated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {carouselItems.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                      <FiImage className="text-gray-300 mx-auto mb-4" size={48} />
                      <p className="text-gray-500 text-lg">No carousel items yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Add your first carousel item using the form above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this carousel item? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
        confirmLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default CarouselManagementModal;