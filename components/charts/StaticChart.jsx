
import { useState } from 'react';

const StaticChart = () => {
  const [selectedRange, setSelectedRange] = useState("1D");
  return (
    <div className="bg-white p-5 rounded-5 w-100 staticChart">
      {/* Time Range Selector */}
      <div className="d-flex mb-3 range_btns">
        {["1D", "5D", "1M", "6M", "1Y", "5Y", "Max"].map((range) => (
          <li className="list-unstyled">
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`${selectedRange === range ? 'active' : ''}`}
            >
              {range}
            </button>
          </li>
          
        ))}
      </div>
      
      {/* Chart Placeholder using Table */}
      <table className="table mt-3 position-relative overflow-hidden">
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr key={i} className="border-0">
              <td className="text-secondary small py-5 position-relative">00</td>
            </tr>
          ))}
        </tbody>
        <div className="coming-ipoempty position-absolute bottom-0 start-0 w-100 ms-5"></div>
      </table>

      {/* Time Labels */}
      <div className="d-flex justify-content-between text-secondary small px-2 mt-2">
        {["10:00 am", "12:00 am", "2:00 pm", "4:00 pm", "6:00 pm", "8:00 pm"].map((time, i) => (
          <span key={i}>{time}</span>
        ))}
      </div>
    </div>
  );
};


export default StaticChart;