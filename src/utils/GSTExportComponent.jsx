import {useState} from "react";
import {Button, Select, Modal, message} from "antd";
import {FiArrowDownCircle} from "react-icons/fi";
import {getGstReport} from "../hooks/accounts/useAccounts";
import jsPDF from "jspdf";

// ✅ Extracted Modal Component to prevent re-renders
const ExportModal = ({
  modalVisible,
  setModalVisible,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  loading,
  handleDownload,
  months,
  years,
}) => {
  const handleMonthSelect = (value) => {
    setSelectedMonth(value);
  };

  const handleYearSelect = (value) => {
    setSelectedYear(value);
  };

  return (
    <Modal
      title="📊 Export GST Report"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={500}
      style={{
        top: "20px",
        maxHeight: "90vh",
        overflow: "auto",
        padding: "20px",
      }}
    >
      <p style={{color: "#666", marginBottom: "20px"}}>
        Select the period for GST report generation. The report will show data
        specifically for the selected month and year.
      </p>

      {/* Month Selector */}
      <div style={{marginBottom: "20px"}}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 500,
            color: "#333",
          }}
        >
          Select Month:
        </label>
        <Select
          placeholder="Choose month"
          value={selectedMonth || undefined}
          onChange={handleMonthSelect}
          style={{width: "100%"}}
          options={months}
          size="large"
        />
      </div>

      {/* Year Selector */}
      <div style={{marginBottom: "30px"}}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 500,
            color: "#333",
          }}
        >
          Select Year:
        </label>
        <Select
          placeholder="Choose year"
          value={selectedYear || undefined}
          onChange={handleYearSelect}
          style={{width: "100%"}}
          options={years}
          size="large"
        />
      </div>

      {/* Selected Period */}
      {selectedMonth && selectedYear && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f0f8ff",
            borderRadius: "6px",
            border: "1px solid #91d5ff",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <span style={{color: "#1890ff", fontWeight: 500}}>
            📅 Selected: {months.find((m) => m.value === selectedMonth)?.label}{" "}
            {selectedYear}
          </span>
        </div>
      )}

      {/* Download Buttons */}
      <div style={{display: "flex", gap: "12px", flexDirection: "column"}}>
        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "#389e0d",
            borderColor: "#389e0d",
            height: "50px",
            fontSize: "16px",
            fontWeight: 600,
          }}
          onClick={() => handleDownload("Excel")}
          disabled={!selectedMonth || !selectedYear || loading}
          loading={loading}
          block
        >
          📈 Download Excel Report
        </Button>

        <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            height: "50px",
            fontSize: "16px",
            fontWeight: 600,
          }}
          onClick={() => handleDownload("PDF")}
          disabled={!selectedMonth || !selectedYear || loading}
          loading={loading}
          block
        >
          📄 Download PDF Report
        </Button>
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#fff7e6",
          borderRadius: "6px",
          border: "1px solid #ffd591",
        }}
      >
        <div style={{fontSize: "12px", color: "#fa8c16", textAlign: "center"}}>
          💡 <strong>Note:</strong> Reports are generated specifically for the
          selected month and year period.
        </div>
      </div>
    </Modal>
  );
};

const GSTExportComponent = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const months = [
    {value: "01", label: "January"},
    {value: "02", label: "February"},
    {value: "03", label: "March"},
    {value: "04", label: "April"},
    {value: "05", label: "May"},
    {value: "06", label: "June"},
    {value: "07", label: "July"},
    {value: "08", label: "August"},
    {value: "09", label: "September"},
    {value: "10", label: "October"},
    {value: "11", label: "November"},
    {value: "12", label: "December"},
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

  // Process API data based on actual GST values from API
  const processGSTData = (apiData) => {
    const {feePayments = [], allExpenses = [], summary = {}} = apiData;

    // Use actual GST values from API data instead of hardcoding
    const incomeData = feePayments.reduce(
      (acc, payment) => {
        // Use actual GST values from payment if available, otherwise calculate
        const gstAmount = payment.gstAmount || 0;
        const taxableValue = payment.taxableValue || payment.amount - gstAmount;
        const cgst = payment.cgst || gstAmount / 2;
        const sgst = payment.sgst || gstAmount / 2;

        return {
          totalSales: acc.totalSales + (payment.amount || 0),
          taxableValue: acc.taxableValue + taxableValue,
          gstAmount: acc.gstAmount + gstAmount,
          cgst: acc.cgst + cgst,
          sgst: acc.sgst + sgst,
          totalTax: acc.totalTax + gstAmount,
          transactionCount: acc.transactionCount + 1,
        };
      },
      {
        totalSales: 0,
        taxableValue: 0,
        gstAmount: 0,
        cgst: 0,
        sgst: 0,
        totalTax: 0,
        transactionCount: 0,
      },
    );

    // Categorize expenses based on actual API data
    const expenseCategories = allExpenses.reduce((acc, expense) => {
      const category = expense.category || "Others";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount || 0;
      return acc;
    }, {});

    // Use summary data directly from API
    return {
      incomeData,
      expenseCategories,
      summary: {
        totalIncome: summary.totalIncome || 0,
        totalExpense: summary.totalExpense || 0,
        netProfit: summary.netProfit || 0,
        // Include any other summary fields from API
        ...summary,
      },
      transactionCount: {
        income: feePayments.length,
        expense: allExpenses.length,
      },
      // Include raw data for debugging
      rawData: {
        feePayments,
        allExpenses,
        summary,
      },
    };
  };

  // Format currency with proper rupee symbol
  const formatCurrency = (amount) => {
    // Use "Rs." instead of rupee symbol to avoid encoding issues
    return `Rs. ${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  // Proper PDF Generation with correct currency formatting
  const generatePDF = (gstData, month, year) => {
    const monthName = months.find((m) => m.value === month)?.label;
    const {incomeData, expenseCategories, summary, transactionCount} = gstData;

    // Create new PDF document
    const doc = new jsPDF();
    let yPosition = 20; // Starting Y position

    // Set colors
    const primaryColor = [41, 128, 185];
    const secondaryColor = [52, 152, 219];
    const accentColor = [46, 204, 113];

    // Add header with background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("GST COMPLIANCE REPORT", 105, 20, {align: "center"});

    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`HEAVENS LIVING - ${monthName} ${year}`, 105, 28, {
      align: "center",
    });

    yPosition = 50;

    // Report Information
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, yPosition);
    doc.text(
      `Report ID: GST-${month}${year}-${Date.now().toString().slice(-6)}`,
      150,
      yPosition,
    );
    yPosition += 15;

    // Business Information Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("BUSINESS INFORMATION", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Business Name: Heavens Living`, 25, yPosition);
    yPosition += 6;
    doc.text(`GSTIN: 07AABCU9603R1ZM`, 25, yPosition);
    yPosition += 6;
    doc.text(`Report Period: ${monthName} ${year}`, 25, yPosition);
    yPosition += 15;

    // Financial Summary Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("FINANCIAL SUMMARY", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // Financial data rows - FIXED: Using Rs. instead of rupee symbol
    const financialData = [
      {
        label: "Total Sales/Income",
        value: formatCurrency(incomeData.totalSales),
      },
      {label: "Taxable Value", value: formatCurrency(incomeData.taxableValue)},
      {label: "CGST Collected", value: formatCurrency(incomeData.cgst)},
      {label: "SGST Collected", value: formatCurrency(incomeData.sgst)},
      {
        label: "Total GST Liability",
        value: formatCurrency(incomeData.totalTax),
      },
    ];

    financialData.forEach((item) => {
      doc.text(`• ${item.label}:`, 25, yPosition);
      doc.text(item.value, 120, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Transaction Overview Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("TRANSACTION OVERVIEW", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const transactionData = [
      {label: "Income Transactions", value: transactionCount.income.toString()},
      {
        label: "Expense Transactions",
        value: transactionCount.expense.toString(),
      },
      {label: "Total Revenue", value: formatCurrency(summary.totalIncome)},
      {label: "Total Expenditure", value: formatCurrency(summary.totalExpense)},
      {label: "Net Profit/Loss", value: formatCurrency(summary.netProfit)},
    ];

    transactionData.forEach((item) => {
      doc.text(`• ${item.label}:`, 25, yPosition);
      doc.text(item.value, 120, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Expense Categories Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("EXPENSE CATEGORIES", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    Object.entries(expenseCategories).forEach(([category, amount]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${category}:`, 25, yPosition);
      doc.text(formatCurrency(amount), 120, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Compliance Notes Section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("COMPLIANCE NOTES", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    const notes = [
      `This report is generated based on actual transaction data for ${monthName} ${year}.`,
      "Report is generated by Heavens Living Accounting System.",
      "This document serves as a GST compliance record.",
    ];

    notes.forEach((note) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${note}`, 25, yPosition, {maxWidth: 160});
      yPosition += 12;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, {align: "center"});
      doc.text("Confidential - Heavens Living GST Report", 105, 295, {
        align: "center",
      });
    }

    // Generate the PDF blob
    return doc.output("blob");
  };

  // Excel Generation with proper currency formatting
  const generateExcel = (gstData, month, year) => {
    const monthName = months.find((m) => m.value === month)?.label;
    const {incomeData, expenseCategories, summary, transactionCount, rawData} =
      gstData;

    // Enhanced Excel data structure with period information
    const excelData = [
      ["GST COMPLIANCE REPORT - HEAVENS LIVING"],
      [""],
      ["Business Name", "Heavens Living", "", ""],
      ["GSTIN", "07AABCU9603R1ZM", "", ""],
      ["Report Period", `${monthName} ${year}`, "", ""],
      ["Generated On", new Date().toLocaleDateString(), "", ""],
      ["Report ID", `GST-${month}${year}-${Date.now()}`, "", ""],
      ["Data Period", `${month}/${year}`, "API Filter", ""],
      [""],
      ["FINANCIAL SUMMARY", "", "", ""],
      ["Category", "Description", "Amount", "Period"],
      [
        "Income",
        "Total Sales",
        `Rs. ${incomeData.totalSales.toLocaleString("en-IN")}`,
        `${monthName} ${year}`,
      ],
      [
        "GST",
        "Taxable Value",
        `Rs. ${incomeData.taxableValue.toFixed(2)}`,
        `${monthName} ${year}`,
      ],
      [
        "GST",
        "CGST Collected",
        `Rs. ${incomeData.cgst.toFixed(2)}`,
        `${monthName} ${year}`,
      ],
      [
        "GST",
        "SGST Collected",
        `Rs. ${incomeData.sgst.toFixed(2)}`,
        `${monthName} ${year}`,
      ],
      [
        "GST",
        "Total GST Liability",
        `Rs. ${incomeData.totalTax.toFixed(2)}`,
        `${monthName} ${year}`,
      ],
      [""],
      ["TRANSACTION SUMMARY", "", "", ""],
      ["Type", "Description", "Count", "Amount"],
      [
        "Income",
        "Total Transactions",
        transactionCount.income,
        `Rs. ${summary.totalIncome.toLocaleString("en-IN")}`,
      ],
      [
        "Expense",
        "Total Transactions",
        transactionCount.expense,
        `Rs. ${summary.totalExpense.toLocaleString("en-IN")}`,
      ],
      [
        "Summary",
        "Net Profit/Loss",
        "",
        `Rs. ${summary.netProfit.toLocaleString("en-IN")}`,
      ],
      [""],
      ["EXPENSE BREAKDOWN", "", "", ""],
      ["Category", "Amount", "Percentage", ""],
      ...Object.entries(expenseCategories).map(([category, amount]) => [
        category,
        `Rs. ${amount.toLocaleString("en-IN")}`,
        summary.totalExpense > 0
          ? ((amount / summary.totalExpense) * 100).toFixed(2) + "%"
          : "0%",
        "",
      ]),
      [""],
      ["API DATA INFO", "", "", ""],
      ["Data Point", "Value", "", ""],
      ["Fee Payments Count", rawData.feePayments.length, "", ""],
      ["Expenses Count", rawData.allExpenses.length, "", ""],
      [
        "API Total Income",
        `Rs. ${(rawData.summary.totalIncome || 0).toLocaleString("en-IN")}`,
        "",
        "",
      ],
      [
        "API Total Expense",
        `Rs. ${(rawData.summary.totalExpense || 0).toLocaleString("en-IN")}`,
        "",
        "",
      ],
      [""],
      ["COMPLIANCE NOTES", "", "", ""],
      ["Note", `Report generated for ${monthName} ${year}`, "", ""],
      ["Note", "All calculations based on actual transaction data", "", ""],
      ["Note", "Data filtered by selected period", "", ""],
    ];

    // Convert to CSV format with proper encoding
    const csvContent = excelData
      .map((row) =>
        row
          .map((cell) => (typeof cell === "string" ? `"${cell}"` : cell))
          .join(","),
      )
      .join("\n");

    // Add BOM for UTF-8 to handle special characters
    const BOM = "\uFEFF";
    return new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  };

  // File Download Utility with error handling
  const downloadFile = (blob, filename) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up after download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      message.error("Failed to download file");
    }
  };

  // Enhanced Download Handler with better error reporting and filter integration
  const handleDownload = async (format) => {
    if (!selectedMonth || !selectedYear) {
      message.error("Please select both month and year");
      return;
    }

    const monthName = months.find((m) => m.value === selectedMonth)?.label;

    setLoading(true);
    message.loading(
      `Generating ${format} report for ${monthName} ${selectedYear}...`,
      2,
    );

    try {
      console.log(`Fetching GST data for: ${selectedMonth}/${selectedYear}`);

      // Call the API with month and year filters - CORRECTED FILTER INTEGRATION
      const apiData = await getGstReport({
        month: selectedMonth, // This will be passed as params to the API
        year: selectedYear, // This will be passed as params to the API
      });

      console.log("API Response with filters:", apiData);

      if (!apiData) {
        throw new Error("No data received from API");
      }

      // Process the API data for GST reporting
      const gstData = processGSTData(apiData);

      console.log("Processed GST Data with filters:", gstData);

      let blob, filename;

      if (format === "Excel") {
        blob = generateExcel(gstData, selectedMonth, selectedYear);
        filename = `GST_Report_${monthName}_${selectedYear}.csv`;
      } else {
        blob = generatePDF(gstData, selectedMonth, selectedYear);
        filename = `GST_Report_${monthName}_${selectedYear}.pdf`;
      }

      downloadFile(blob, filename);
      message.success(
        `${format} report for ${monthName} ${selectedYear} downloaded successfully!`,
      );

      // Close modal and reset
      setModalVisible(false);
    } catch (error) {
      console.error("Download Error:", error);
      message.error(
        `Failed to generate ${format} report for ${monthName} ${selectedYear}. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal instead of dropdown
  const handleExportClick = () => {
    setModalVisible(true);
  };

  return (
    <>
      <Button
        style={{
          flex: 1,
          minWidth: "150px",
          backgroundColor: "white",
          borderColor: "#059669",
          color: "#059669",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          height: "48px",
          fontWeight: "600",
        }}
        onClick={handleExportClick}
        loading={loading}
      >
        <FiArrowDownCircle /> Export GST
      </Button>

      <ExportModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        loading={loading}
        handleDownload={handleDownload}
        months={months}
        years={years}
      />
    </>
  );
};

export default GSTExportComponent;
