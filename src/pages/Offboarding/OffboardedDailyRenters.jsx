import {useState} from "react";
import {useSelector} from "react-redux";
import {offboardingApiService} from "../../hooks/offboarding/offBoardingapiService";
import {useQuery} from "@tanstack/react-query";
import {OffboardedDailyRentersTable} from "../../components/index.js";
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

function OffboardedDailyRenters() {
  // Currently selected Property ID from Redux
  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  //   State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = usePersistentState(
    "offboarded-residents-search",
    ""
  );

  const pageSize = 25;

  //   Fetch offboarded daily renters using tanstack query
  const {data, isLoading} = useQuery({
    queryKey: [
      "offboardedDailyRenters",
      selectedPropertyId,
      currentPage,
      searchTerm,
    ],
    queryFn: () =>
      offboardingApiService.fetchOffboardedUsers({
        rentType: "daily",
        propertyId: selectedPropertyId,
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      }),
  });

  return (
    <>
      <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      <OffboardedDailyRentersTable
        data={data?.data || []}
        pagination={data?.pagination}
        loading={isLoading}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
}

export default OffboardedDailyRenters;
