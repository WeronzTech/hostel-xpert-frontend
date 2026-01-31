import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {offboardingApiService} from "../../hooks/offboarding/offBoardingapiService.js";
import {OffboardedResidentsTable} from "../../components/index.js";
import {useState} from "react";
import {Col, Input, Row} from "antd";
import {FiSearch} from "react-icons/fi";
import usePersistentState from "../../hooks/usePersistentState.js";

const Search = ({onSearch, searchTerm = ""}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        {/* Search Input - Left side */}
        <Col span={24}>
          <Input
            placeholder="Search by Name, Contact, Room and the Sharing type.................."
            prefix={<FiSearch />}
            onChange={(e) => onSearch(e.target.value)}
            value={searchTerm}
            allowClear
            size="middle"
          />
        </Col>
      </Row>
    </div>
  );
};

const OffboardedResidents = () => {
  // Currently selected Property ID from Redux
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  const [searchTerm, setSearchTerm] = usePersistentState(
    "offboarded-residents-search",
    ""
  );

  //   State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 25;

  //   Fetch offboarded residents using tanstack query
  const {data, isLoading} = useQuery({
    queryKey: [
      "offboardedResidents",
      selectedPropertyId,
      currentPage,
      searchTerm,
    ],
    queryFn: () =>
      offboardingApiService.fetchOffboardedUsers({
        rentType: "monthly",
        propertyId: selectedPropertyId,
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      }),
  });

  return (
    <>
      <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      <OffboardedResidentsTable
        data={data?.data || []}
        pagination={data?.pagination}
        loading={isLoading}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};

export default OffboardedResidents;
