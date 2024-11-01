import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const [inputs, setInputs] = useState({
    office: "",
    landSection: "",
    numberOfPeople: "",
    stakePoints: "",
    workArea: "",
    diagramOrNumeric: "圖解區",
    plainOrMountain: "平地",
    cadastralArrangement: "是",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-10">
        <h2 className="text-2xl font-bold">鑑界排班時間預測</h2>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-1">事務所</label>
            <input
              type="text"
              name="office"
              value={inputs.office}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="事務所"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">地段</label>
            <input
              type="text"
              name="landSection"
              value={inputs.landSection}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="地段"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">人數</label>
            <input
              type="text"
              name="numberOfPeople"
              value={inputs.numberOfPeople}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="人數"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">測釘點數</label>
            <input
              type="text"
              name="stakePoints"
              value={inputs.stakePoints}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="測釘點數"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">作業面積</label>
            <input
              type="text"
              name="workArea"
              value={inputs.workArea}
              onChange={handleInputChange}
              className="border p-2 w-full"
              placeholder="作業面積"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              圖解區或數值區
            </label>
            <select
              name="diagramOrNumeric"
              value={inputs.diagramOrNumeric}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="圖解區">圖解區</option>
              <option value="數值區">數值區</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">平地或山區</label>
            <select
              name="plainOrMountain"
              value={inputs.plainOrMountain}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="平地">平地</option>
              <option value="山區">山區</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              是否辦理地籍整理
            </label>
            <select
              name="cadastralArrangement"
              value={inputs.cadastralArrangement}
              onChange={handleInputChange}
              className="border p-2 w-full"
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => console.log(inputs)}
          className="bg-black text-white p-3 mt-4 hover:bg-gray-800 w-48 text-base"
        >
          預測
        </button>
      </div>
    </div>
  );
};

export default HomePage;
