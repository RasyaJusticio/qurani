import React from 'react';

const cityData = [
  { no: 1, kota: 'Bandung', total: 500 },
  { no: 2, kota: 'Surabaya', total: 400 },
  { no: 3, kota: 'Semarang', total: 300 },
  { no: 4, kota: 'Jakarta', total: 200 },
];

const CityTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-5">
      <h3 className="text-lg font-semibold mb-4">Data Kota</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Kota</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {cityData.map((item) => (
              <tr key={item.no} className="border-b">
                <td className="px-4 py-2 text-sm text-gray-600">{item.no}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.kota}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityTable;
