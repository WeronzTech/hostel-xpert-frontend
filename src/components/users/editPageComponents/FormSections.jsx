// import ResidentBasicInfo from "./ResidentBasicInfo";
// import ResidentStayDetails from "./ResidentStayDetails";
// import ResidentPersonalDetails from "./ResidentPersonalDetails";
// import ResidentAcademicDetails from "./ResidentAcademicDetails";
// import ResidentGuardianDetails from "./ResidentGuardianDetails";
// import ResidentWorkingDetails from "./ResidentWorkingDetails";

// const FormSections = ({
//   resident,
//   images,
//   onImageUpload,
//   onImageRemove,
//   form,
// }) => {
//   if (!resident) return null;

//   const commonProps = {
//     resident,
//     images,
//     onImageUpload,
//     onImageRemove,
//     form,
//   };

//   const renderFormSections = () => {
//     switch (resident.userType) {
//       case "worker":
//         return (
//           <>
//             <ResidentBasicInfo {...commonProps} />
//             <ResidentWorkingDetails {...commonProps} />
//             <ResidentPersonalDetails {...commonProps} />
//             <ResidentStayDetails form={form} resident={resident} />
//           </>
//         );
//       case "dailyRent":
//       case "messOnly":
//         return (
//           <>
//             <ResidentBasicInfo {...commonProps} />
//             <ResidentPersonalDetails {...commonProps} />
//             <ResidentStayDetails form={form} resident={resident} />
//           </>
//         );
//       case "student":
//       default:
//         return (
//           <>
//             <ResidentBasicInfo {...commonProps} />
//             <ResidentAcademicDetails {...commonProps} />
//             <ResidentGuardianDetails {...commonProps} />
//             <ResidentPersonalDetails {...commonProps} />
//             <ResidentStayDetails form={form} resident={resident} />
//           </>
//         );
//     }
//   };

//   return <div>{renderFormSections()}</div>;
// };

// export default FormSections;
import ResidentBasicInfo from "./ResidentBasicInfo";
import ResidentStayDetails from "./ResidentStayDetails";
import ResidentPersonalDetails from "./ResidentPersonalDetails";
import ResidentAcademicDetails from "./ResidentAcademicDetails";
import ResidentGuardianDetails from "./ResidentGuardianDetails";
import ResidentWorkingDetails from "./ResidentWorkingDetails";
import ColivingPartnerDetails from "./ColivingPartnerDetails";

const FormSections = ({
  resident,
  images,
  onImageUpload,
  onImageRemove,
  form,
}) => {
  if (!resident) return null;

  const commonProps = {
    resident,
    images,
    onImageUpload,
    onImageRemove,
    form,
  };

  const renderFormSections = () => {
    // Common base sections for all user types
    const baseSections = {
      worker: (
        <>
          <ResidentBasicInfo {...commonProps} />
          <ResidentWorkingDetails {...commonProps} />
          <ResidentPersonalDetails {...commonProps} />
          <ResidentStayDetails form={form} resident={resident} />
        </>
      ),
      dailyRent: (
        <>
          <ResidentBasicInfo {...commonProps} />
          <ResidentPersonalDetails {...commonProps} />
          <ResidentStayDetails form={form} resident={resident} />
        </>
      ),
      messOnly: (
        <>
          <ResidentBasicInfo {...commonProps} />
          <ResidentPersonalDetails {...commonProps} />
          <ResidentStayDetails form={form} resident={resident} />
        </>
      ),
      student: (
        <>
          <ResidentBasicInfo {...commonProps} />
          <ResidentAcademicDetails {...commonProps} />
          <ResidentGuardianDetails {...commonProps} />
          <ResidentPersonalDetails {...commonProps} />
          <ResidentStayDetails form={form} resident={resident} />
        </>
      ),
      default: (
        <>
          <ResidentBasicInfo {...commonProps} />
          <ResidentAcademicDetails {...commonProps} />
          <ResidentGuardianDetails {...commonProps} />
          <ResidentPersonalDetails {...commonProps} />
          <ResidentStayDetails form={form} resident={resident} />
        </>
      ),
    };

    // Get the base sections for the current user type
    const sections = baseSections[resident.userType] || baseSections.default;

    // Add ColivingPartnerDetails if resident.isColiving is true
    return (
      <>
        {sections}
        {resident.isColiving && <ColivingPartnerDetails {...commonProps} />}
      </>
    );
  };

  return <div>{renderFormSections()}</div>;
};

export default FormSections;
