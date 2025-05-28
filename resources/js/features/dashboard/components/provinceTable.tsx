import React from 'react';

const provinceData = [
  { no: 1, provinsi: 'Jawa Barat', total: 1500 },
  { no: 2, provinsi: 'Jawa Timur', total: 1200 },
  { no: 3, provinsi: 'Jawa Tengah', total: 900 },
  { no: 4, provinsi: 'DKI Jakarta', total: 800 },
];

const ProvinceTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-5">
      <h3 className="text-lg font-semibold mb-4">Data Provinsi</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Provinsi</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {provinceData.map((item) => (
              <tr key={item.no} className="border-b">
                <td className="px-4 py-2 text-sm text-gray-600">{item.no}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.provinsi}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvinceTable;
