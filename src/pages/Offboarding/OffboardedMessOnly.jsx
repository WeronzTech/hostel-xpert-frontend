import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {offboardingApiService} from "../../hooks/offboarding/offBoardingapiService";
import {OffboardedMessOnlyTable} from "../../components";
import {FiSearch} from "react-icons/fi";
import {Col, Input, Row} from "antd";
import usePersistentState from "../../hooks/usePersistentState";

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

function OffboardedMessOnly() {
  //   State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = usePersistentState(
    "offboarded-residents-search",
    ""
  );

  const pageSize = 25;

  //   Fetch offboarded residents using tanstack query
  const {data, isLoading} = useQuery({
    queryKey: ["offboardedMessOnly", currentPage, currentPage, searchTerm],
    queryFn: () =>
      offboardingApiService.fetchOffboardedUsers({
        rentType: "mess",
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      }),
  });

  return (
    <>
      <Search searchTerm={searchTerm} onSearch={setSearchTerm} />
      <OffboardedMessOnlyTable
        data={data?.data || []}
        pagination={data?.pagination}
        loading={isLoading}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
}

export default OffboardedMessOnly;
