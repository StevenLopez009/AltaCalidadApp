"use client";

import { useEffect, useState } from "react";

interface Company {
  id: number;
  name_company: string;
  discount_percentage: number;
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const response = await fetch("/api/company");
    const data = await response.json();

    setCompanies(data);
  }

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-[#161325] p-8 shadow-xl">
      <h2 className="mb-6 text-3xl font-bold text-white">Empresas</h2>

      <table className="w-full text-left">
        <thead className="border-b border-purple-500/20 text-gray-400">
          <tr>
            <th className="py-3">Empresa</th>
            <th className="py-3">Descuento</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-b border-purple-500/10">
              <td className="py-4 text-white">{company.name_company}</td>

              <td className="py-4 text-green-400">
                {company.discount_percentage}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
