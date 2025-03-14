import React, { useContext, useEffect, useState } from "react";
import { OfficeContext } from "../officeContext";
import { useNavigate } from "react-router-dom";
import { getOffices } from "../api/officeApi"; // 請先建立 officeApi.js 並導出 getOffices

const OfficeSelectionPage = () => {
  const { setOffice } = useContext(OfficeContext);
  const [offices, setOffices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const data = await getOffices();
        setOffices(data);
      } catch (error) {
        console.error("Error fetching offices:", error);
      }
    };
    fetchOffices();
  }, []);

  const handleSelect = (e) => {
    const selectedOfficeId = Number(e.target.value);
    const selectedOffice = offices.find(
      (office) => office.office_id === selectedOfficeId
    );
    if (selectedOffice) {
      setOffice(selectedOffice); // 將整個 office 物件存入 context
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">請選擇事務所</h2>
        <select
          onChange={handleSelect}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">請選擇</option>
          {offices.map((office) => (
            <option key={office.office_id} value={office.office_id}>
              {office.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OfficeSelectionPage;
