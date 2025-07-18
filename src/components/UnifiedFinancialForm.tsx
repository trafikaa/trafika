import React, { useState, useEffect } from 'react';
import { CompanyData } from '../types';
import { Calculator, Building, RefreshCw } from 'lucide-react';
import { getCorpCodeByCompanyName } from '../services/companyService';
import { fetchDartFinancialStatement } from '../services/dartApi';
import { DART_DEFAULT_YEAR } from '../constants/finance';

interface UnifiedFinancialFormProps {
  onSubmit: (data: CompanyData) => void;
  companyName?: string;
}

const defaultForm: Partial<CompanyData> = {
  name: '',
  totalAssets: 0,
  totalLiabilities: 0,
  equity: 0,
  currentAssets: 0,
  currentLiabilities: 0,
  revenue: 0,
  netIncome: 0,
  operatingCashFlow: 0,
};

const UnifiedFinancialForm: React.FC<UnifiedFinancialFormProps> = ({ onSubmit, companyName = '' }) => {
  const [formData, setFormData] = useState<Partial<CompanyData>>({ ...defaultForm, name: companyName });
  const [autoFilled, setAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기업명 입력 시 자동으로 corp_code 조회 및 DART API 자동 채움
  useEffect(() => {
    const fetchAndFill = async () => {
      if (!formData.name || formData.name.trim() === '') {
        setAutoFilled(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const corpCode = await getCorpCodeByCompanyName(formData.name.trim());
        console.log('Supabase corpCode:', corpCode);
        if (!corpCode) {
          setAutoFilled(false);
          setError('해당 기업의 corp_code를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        const dartInfo = await fetchDartFinancialStatement(corpCode, DART_DEFAULT_YEAR);
        console.log('DART 재무제표 응답:', dartInfo);
        if (dartInfo && dartInfo.status === '000') {
          // dartInfo에서 필요한 필드 추출 및 자동 채움
          setFormData(prev => ({
            ...prev,
            ...extractCompanyDataFromDart(dartInfo)
          }));
          setAutoFilled(true);
        } else {
          setAutoFilled(false);
          setError('DART API에서 데이터를 불러오지 못했습니다.');
        }
      } catch (err) {
        setAutoFilled(false);
        setError('자동 채움 중 오류가 발생했습니다.');
        console.error('자동 채움 에러:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'name' ? value : Number(value)
    }));
    if (field === 'name') setAutoFilled(false); // 이름 바꾸면 자동채움 해제
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as CompanyData);
  };

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setAutoFilled(false);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">재무 정보 입력</h2>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          초기화
        </button>
      </div>
      {autoFilled && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✅ DART에서 자동으로 불러온 데이터입니다. 필요시 수정 후 분석을 진행하세요.
          </p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyName">기업명</label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="기업명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">총자산 (억원)</label>
            <input
              type="number"
              value={formData.totalAssets}
              onChange={(e) => handleInputChange('totalAssets', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">총부채 (억원)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">자기자본 (억원)</label>
            <input
              type="number"
              value={formData.equity}
              onChange={(e) => handleInputChange('equity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">유동자산 (억원)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">유동부채 (억원)</label>
            <input
              type="number"
              value={formData.currentLiabilities}
              onChange={(e) => handleInputChange('currentLiabilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매출액 (억원)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">순이익 (억원)</label>
            <input
              type="number"
              value={formData.netIncome}
              onChange={(e) => handleInputChange('netIncome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">영업현금흐름 (억원)</label>
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
          disabled={loading}
        >
          <Calculator className="w-4 h-4" />
          분석 시작하기
        </button>
      </form>
    </div>
  );
};

// DART API 응답에서 CompanyData로 변환하는 함수 (필요에 따라 수정)
function extractCompanyDataFromDart(dartInfo: any): Partial<CompanyData> {
  // dartInfo.list에서 필요한 항목 추출
  const result: Partial<CompanyData> = {};
  if (!dartInfo.list || !Array.isArray(dartInfo.list)) return result;

  dartInfo.list.forEach((item: any) => {
    const amount = parseInt(item.thstrm_amount?.replace(/,/g, '') || '0', 10) / 100000000; // 억원 단위
    switch (item.account_nm) {
      case '자산총계':
        result.totalAssets = amount;
        break;
      case '부채총계':
        result.totalLiabilities = amount;
        break;
      case '자본총계':
        result.equity = amount;
        break;
      case '유동자산':
        result.currentAssets = amount;
        break;
      case '유동부채':
        result.currentLiabilities = amount;
        break;
      case '매출액':
        result.revenue = amount;
        break;
      case '당기순이익':
        result.netIncome = amount;
        break;
      case '영업활동현금흐름':
        result.operatingCashFlow = amount;
        break;
    }
  });

  return result;
}

export default UnifiedFinancialForm; 