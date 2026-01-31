import {useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Form, Button, message, ConfigProvider} from "antd";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import dayjs from "dayjs";
import PageHeader from "../../components/common/PageHeader";
import FormSections from "../../components/users/editPageComponents/FormSections";
import {
  getResidentById,
  updateResidentByAdmin,
} from "../../hooks/users/useUser";
import {purpleButton} from "../../data/common/color";
import useImageHandler from "../../hooks/users/useImageHandler";
import {useSelector} from "react-redux";

const EditResident = () => {
  const {user} = useSelector((state) => state.auth);
  const {id} = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  // Fetch resident data
  const {data: resident} = useQuery({
    queryKey: ["resident", id],
    queryFn: () => getResidentById(id),
    staleTime: 1000 * 60 * 5,
  });

  // Image handling
  const {images, handleUpload, handleRemove} = useImageHandler(
    form,
    resident?.personalDetails || {}
  );

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (formData) => updateResidentByAdmin(id, formData),
    onSuccess: (data) => {
      messageApi.success({content: `${data.message}`, duration: 3});
      queryClient.invalidateQueries(["resident", id]);
      navigate(`/resident/${id}`);
    },
    onError: (error) => {
      messageApi.error({content: `${error.message}`, duration: 3});
    },
  });

  // Initialize form when data loads
  useEffect(() => {
    if (resident && form) {
      const initialValues = {
        ...resident,
        personalDetails: {
          ...resident.personalDetails,
          dob: resident.personalDetails?.dob
            ? dayjs(resident.personalDetails.dob)
            : null,
        },
        stayDetails: {
          ...resident.stayDetails,
          joinDate: resident.stayDetails?.joinDate
            ? dayjs(resident.stayDetails.joinDate)
            : null,
          checkInDate: resident.stayDetails?.checkInDate
            ? dayjs(resident.stayDetails.checkInDate)
            : null,
          checkOutDate: resident.stayDetails?.checkOutDate
            ? dayjs(resident.stayDetails.checkOutDate)
            : null,
        },
        messDetails: {
          ...resident.messDetails,
          messStartDate: resident.messDetails?.messStartDate
            ? dayjs(resident.messDetails.messStartDate)
            : null,
          messEndDate: resident.messDetails?.messEndDate
            ? dayjs(resident.messDetails.messEndDate)
            : null,
        },
      };
      form.setFieldsValue(initialValues);
    }
  }, [resident, form]);

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue(true); // ✅ includes all nested fields
      const formData = new FormData();

      const appendToFormData = (data, prefix = "") => {
        Object.entries(data).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (value === undefined || value === null) return;

          if (dayjs.isDayjs(value)) {
            formData.append(fullKey, value.format("YYYY-MM-DD"));
          } else if (typeof value === "object" && !(value instanceof File)) {
            appendToFormData(value, fullKey);
          } else {
            formData.append(fullKey, value);
          }
        });
      };

      appendToFormData(values);

      // Image logic...
      Object.entries(images).forEach(([field, imageData]) => {
        if (imageData.file) {
          formData.append(field, imageData.file);
        } else if (imageData.url) {
          formData.set(`personalDetails.${field}`, imageData.url);
        }
      });

      if (images.profileImg?.remove) {
        formData.append("deleteProfileImg", "true");
      }
      if (images.aadharFront?.remove) {
        formData.append("deleteAadharFront", "true");
      }
      if (images.aadharBack?.remove) {
        formData.append("deleteAadharBack", "true");
      }

      // ✅ Partner Image Removal - check for remove flag
      if (images.partnerProfileImg?.remove) {
        formData.append("deletePartnerProfileImg", "true");
      }
      if (images.partnerAadharFront?.remove) {
        formData.append("deletePartnerAadharFront", "true");
      }
      if (images.partnerAadharBack?.remove) {
        formData.append("deletePartnerAadharBack", "true");
      }

      formData.append("adminName", user.name);

      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Submission error:", error);
      message.error("Failed to submit form");
    }
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title={`Edit Resident - ${resident?.name || ""}`}
          subtitle="Modify resident profile, personal info, and documents"
        />

        <Form
          form={form}
          onFinish={() => handleSubmit()}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm p-5 sm:p-6"
          layout="vertical"
          requiredMark={false}
        >
          <FormSections
            resident={resident}
            images={images}
            onImageUpload={handleUpload}
            onImageRemove={handleRemove}
            form={form}
          />

          <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-6 sm:pr-6 p-4 border-t border-gray-200">
            <Button
              size="large"
              onClick={() => navigate(`/resident/${id}`)}
              className="w-full sm:w-auto mb-2"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <ConfigProvider theme={purpleButton}>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                loading={updateMutation.isPending}
                className="w-full sm:w-auto mb-2"
              >
                Save Changes
              </Button>
            </ConfigProvider>
          </div>
        </Form>
      </div>
    </>
  );
};

export default EditResident;
