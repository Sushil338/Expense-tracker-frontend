import React, { useState } from 'react';

const FilterBar = ({ onApply, currentFilter }) => {
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");

  const presets = ["ALL", "24H", "7D", "1M", "3M"];

  const handlePresetClick = (f) => {
    if (f === "ALL") {
      setTempStart("");
      setTempEnd("");
      onApply("ALL", "", "");
    } else {
      const today = new Date();
      let start = new Date();
      if (f === "24H") start.setDate(today.getDate() - 1);
      if (f === "7D") start.setDate(today.getDate() - 7);
      if (f === "1M") start.setMonth(today.getMonth() - 1);
      if (f === "3M") start.setMonth(today.getMonth() - 3);
      
      const s = start.toISOString().split('T')[0];
      const e = today.toISOString().split('T')[0];
      setTempStart(s);
      setTempEnd(e);
      onApply(f, s, e);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-3xl shadow-sm border items-center">
      <div className="flex gap-2">
        {presets.map(f => (
          <button
            key={f}
            onClick={() => handlePresetClick(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition ${
              currentFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center ml-auto">
        <input type="date" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="border p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button
          onClick={() => onApply("CUSTOM", tempStart, tempEnd)}
          className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterBar;