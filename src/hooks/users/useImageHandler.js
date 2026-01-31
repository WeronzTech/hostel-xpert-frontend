// import {useState} from "react";

// const useImageHandler = (form, initialImages = {}) => {
//   const [images, setImages] = useState(() => {
//     const state = {};
//     ["profileImg", "aadharFront", "aadharBack"].forEach((key) => {
//       if (initialImages[key]) {
//         state[key] = {
//           url: initialImages[key],
//           file: null,
//           preview: null,
//         };
//       }
//     });
//     return state;
//   });

//   const handleUpload = (field, file) => {
//     const preview = URL.createObjectURL(file);
//     setImages((prev) => ({
//       ...prev,
//       [field]: {file, preview, url: null},
//     }));
//     return preview;
//   };

//   const handleRemove = (field) => {
//     // 1. Clear preview and file, and mark for deletion
//     onImageRemove(field); // ✅ assuming this updates images[field] correctly

//     // 2. Clear the value in the form field (if needed)
//     const personal = form.getFieldValue("personalDetails") || {};
//     form.setFieldsValue({
//       personalDetails: {
//         ...personal,
//         [field]: "",
//       },
//     });

//     // 3. ✅ Mark the image for deletion
//     setImages((prev) => ({
//       ...prev,
//       [field]: {
//         file: null,
//         url: "",
//         remove: true, // <- this is crucial
//       },
//     }));
//   };

//   const onImageRemove = (field) => {
//     setImages((prev) => ({
//       ...prev,
//       [field]: {
//         file: null,
//         url: "",
//         remove: true, // preserve this
//       },
//     }));
//   };

//   const cleanup = () => {
//     Object.values(images).forEach((img) => {
//       if (img?.preview) URL.revokeObjectURL(img.preview);
//     });
//   };

//   return {images, handleUpload, handleRemove, cleanup};
// };

// export default useImageHandler;
import {useState} from "react";

const useImageHandler = (form, initialImages = {}) => {
  const [images, setImages] = useState(() => {
    const state = {};
    // ✅ Initialize both personal AND partner images
    const allImageKeys = [
      "profileImg",
      "aadharFront",
      "aadharBack",
      "partnerProfileImg",
      "partnerAadharFront",
      "partnerAadharBack",
    ];

    allImageKeys.forEach((key) => {
      if (initialImages[key]) {
        state[key] = {
          url: initialImages[key],
          file: null,
          preview: null,
        };
      }
    });
    return state;
  });

  const handleUpload = (field, file) => {
    const preview = URL.createObjectURL(file);
    setImages((prev) => ({
      ...prev,
      [field]: {file, preview, url: null, remove: false},
    }));
    return preview;
  };

  const handleRemove = (field) => {
    console.log("Removing image:", field);

    // ✅ Single function to handle removal
    setImages((prev) => ({
      ...prev,
      [field]: {
        file: null,
        url: "",
        preview: null,
        remove: true,
      },
    }));

    // ✅ Clear the appropriate form field based on image type
    if (field.startsWith("partner")) {
      // Partner images - map to correct form field
      const formFieldMap = {
        partnerProfileImg: "profileImg",
        partnerAadharFront: "aadharFront",
        partnerAadharBack: "aadharBack",
      };
      const formField = formFieldMap[field];

      const colivingPartner = form.getFieldValue("colivingPartner") || {};
      form.setFieldsValue({
        colivingPartner: {
          ...colivingPartner,
          [formField]: "",
        },
      });
    } else {
      // Personal images
      const personal = form.getFieldValue("personalDetails") || {};
      form.setFieldsValue({
        personalDetails: {
          ...personal,
          [field]: "",
        },
      });
    }
  };

  const cleanup = () => {
    Object.values(images).forEach((img) => {
      if (img?.preview) URL.revokeObjectURL(img.preview);
    });
  };

  return {images, handleUpload, handleRemove, cleanup};
};

export default useImageHandler;
