import React, { useState } from 'react';
import { CompanyData } from '../types';
import { Calculator, Building } from 'lucide-react';

interface FinancialFormProps {
  onSubmit: (data: CompanyData) => void;
  companyName: string;
}

const FinancialForm: React.FC<FinancialFormProps> = ({ onSubmit, companyName }) => {
  const [formData, setFormData] = useState<Partial<CompanyData>>({
    name: companyName,
    totalAssets: 0,
    totalLiabilities: 0,
    equity: 0,
    currentAssets: 0,
    currentLiabilities: 0,
    revenue: 0,
    netIncome: 0,
    operatingCashFlow: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as CompanyData);
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'name' ? value : Number(value)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">재무 정보 입력</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            기업명
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="기업명을 입력하세요"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              총자산 (억원)
            </label>
            <input
              type="number"
              value={formData.totalAssets}
              onChange={(e) => handleInputChange('totalAssets', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              총부채 (억원)
            </label>
            <input
              type="number"
              value={formData.totalLiabilities}
              onChange={(e) => handleInputChange('totalLiabilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자기자본 (억원)
            </label>
            <input
              type="number"
              value={formData.equity}
              onChange={(e) => handleInputChange('equity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유동자산 (억원)
            </label>
            <input
              type="number"
              value={formData.currentAssets}
              onChange={(e) => handleInputChange('currentAssets', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유동부채 (억원)
            </label>
            <input
              type="number"
              value={formData.currentLiabilities}
              onChange={(e) => handleInputChange('currentLiabilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              매출액 (억원)
            </label>
            <input
              type="number"
              value={formData.revenue}
              onChange={(e) => handleInputChange('revenue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              순이익 (억원)
            </label>
            <input
              type="number"
              value={formData.netIncome}
              onChange={(e) => handleInputChange('netIncome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              영업현금흐름 (억원)
            </label>
            <input
              type="number"
              value={formData.operatingCashFlow}
              onChange={(e) => handleInputChange('operatingCashFlow', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          분석 시작하기
        </button>
      </form>
    </div>
  );
};

export default FinancialForm;