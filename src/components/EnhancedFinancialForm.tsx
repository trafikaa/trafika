import React, { useState, useEffect } from 'react';
import { CompanyData } from '../types';
import { Calculator, Building, RefreshCw } from 'lucide-react';

interface EnhancedFinancialFormProps {
  onSubmit: (data: CompanyData) => void;
  companyName: string;
  initialData?: CompanyData | null;
}

const EnhancedFinancialForm: React.FC<EnhancedFinancialFormProps> = ({ 
  onSubmit, 
  companyName, 
  initialData 
}) => {
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

  // 초기 데이터가 있으면 폼에 채우기
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const resetForm = () => {
    setFormData({
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
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">재무 정보 입력</h2>
        </div>
        {initialData && (
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      {initialData && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✅ 다트(DART)에서 자동으로 불러온 데이터입니다. 필요시 수정 후 분석을 진행하세요.
          </p>
        </div>
      )}
      
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Calculator className="w-5 h-5" />
          부실 위험도 분석 시작하기
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          💡 <strong>팁:</strong> 다트(DART)에서 자동으로 불러온 데이터는 최신 공시 기준입니다. 
          더 정확한 분석을 위해 필요시 수정하여 사용하세요.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFinancialForm;