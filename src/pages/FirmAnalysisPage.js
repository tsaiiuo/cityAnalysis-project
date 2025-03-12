import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// 註冊 chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);
const BASE_URL = process.env.REACT_APP_BASE_URL;

const DashboardPage = () => {
  // 計算目前月份 (1~12)
  const currentMonth = new Date().getMonth() + 1;
  // 產生月份選項陣列 [1, 2, ..., currentMonth]
  const monthOptions = Array.from({ length: currentMonth }, (_, i) => i + 1);

  // 針對員工工時，預設選取目前月份
  const [selectedMonthEmployee, setSelectedMonthEmployee] =
    useState(currentMonth);
  // 針對地段號分佈，預設選取目前月份（原本每月事件分佈改為每月地段號分佈）
  const [selectedMonthDistribution, setSelectedMonthDistribution] =
    useState(currentMonth);

  // 員工工時資料 (初始為空，待 API 取得資料後更新)
  const [employeeWorkHours, setEmployeeWorkHours] = useState({
    labels: [],
    datasets: [
      {
        label: "員工工時",
        data: [],
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  });

  // 每月事件總量資料（保持不變）
  const [monthlyEventTotals, setMonthlyEventTotals] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "每月事件總量",
        data: Array(12).fill(0),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  });

  // 每月地段號分佈資料（原本的每月事件分佈改成這裡）
  const [monthlyLandSectionDistribution, setMonthlyLandSectionDistribution] =
    useState({
      labels: [],
      datasets: [
        {
          label: "每月地段號分佈",
          data: [],
          borderColor: "rgba(255,159,64,1)",
          backgroundColor: "rgba(255,159,64,0.5)",
          fill: true,
        },
      ],
    });

  // 取得該月所有員工工時總計 (依 monthly_work_hours API)
  useEffect(() => {
    const fetchEmployeeWorkHours = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`${BASE_URL}/monthly_work_hours`, {
          params: {
            month: selectedMonthEmployee,
            year: currentYear,
          },
        });
        // 格式：[{ employee_id, name, total_hours }, ...]
        const data = response.data;
        const labels = data.map((item) => item.name);
        const workHoursData = data.map((item) => Number(item.total_hours));
        setEmployeeWorkHours({
          labels: labels,
          datasets: [
            {
              label: "員工工時",
              data: workHoursData,
              backgroundColor: "rgba(75,192,192,0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching monthly employee work hours:", error);
      }
    };

    fetchEmployeeWorkHours();
  }, [selectedMonthEmployee]);

  // 取得整年每月的事件總量 (保持不變)
  useEffect(() => {
    const fetchMonthlyEventTotals = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`${BASE_URL}/tasks/yearly_counts`, {
          params: { year: currentYear },
        });
        // response.data 格式: { "year": <year>, "monthly_counts": [{month: 1, count: ...}, ...] }
        const { monthly_counts } = response.data;
        const counts = Array(12).fill(0);
        monthly_counts.forEach((item) => {
          counts[item.month - 1] = item.count;
        });
        setMonthlyEventTotals({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "每月事件總量",
              data: counts,
              backgroundColor: "rgba(153,102,255,0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching monthly events totals:", error);
      }
    };

    fetchMonthlyEventTotals();
  }, []);

  // 取得指定月份的地段號分佈 (依 land_section 統計)
  useEffect(() => {
    const fetchLandSectionStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(
          `${BASE_URL}/tasks/land_section_stats`,
          {
            params: {
              month: selectedMonthDistribution,
              year: currentYear,
            },
          }
        );
        // response.data 格式: { year, month, land_section_stats: [{ land_section: "536", count: 2 }, ...] }
        const { land_section_stats } = response.data;
        // 如果沒有資料，可傳回空陣列
        const labels = land_section_stats.map((item) => item.land_section);
        const counts = land_section_stats.map((item) => Number(item.count));
        setMonthlyLandSectionDistribution({
          labels: labels,
          datasets: [
            {
              label: "每月地段號分佈",
              data: counts,
              borderColor: "rgba(255,159,64,1)",
              backgroundColor: "rgba(255,159,64,0.5)",
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching land section stats:", error);
      }
    };

    fetchLandSectionStats();
  }, [selectedMonthDistribution]);

  return (
    <div className="flex h-screen overflow-y-auto">
      {/* 左側選單 */}
      <Sidebar />
      {/* 右側主要內容區 */}
      <div className="w-2/3  overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">儀表板</h2>

        {/* 員工工時圖表區塊 */}
        <div className="bg-white p-6 rounded-md shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">員工工時</h3>
          {/* 新增選擇月份的下拉選單 */}
          <div className="mb-4">
            <label className="mr-2 font-medium">選擇月份:</label>
            <select
              value={selectedMonthEmployee}
              onChange={(e) => setSelectedMonthEmployee(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          </div>
          <Bar data={employeeWorkHours} />
        </div>

        {/* 每月事件總量圖表區塊 */}
        <div className="bg-white p-6 rounded-md shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">每月事件總量</h3>
          <Bar data={monthlyEventTotals} />
        </div>

        {/* 每月地段號分佈圖表區塊 */}
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-4">每月地段號分佈</h3>
          {/* 新增選擇月份的下拉選單 */}
          <div className="mb-4">
            <label className="mr-2 font-medium">選擇月份:</label>
            <select
              value={selectedMonthDistribution}
              onChange={(e) =>
                setSelectedMonthDistribution(Number(e.target.value))
              }
              className="p-2 border border-gray-300 rounded-md"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          </div>
          <Bar data={monthlyLandSectionDistribution} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
