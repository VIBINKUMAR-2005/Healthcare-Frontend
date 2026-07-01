import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const SymptomChecker = () => {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSymptoms, setFetchingSymptoms] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/symptoms/list').then(({ data }) => {
      setAllSymptoms(data.symptoms || []);
      setFetchingSymptoms(false);
    });
  }, []);

  const toggleSymptom = (symptom) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
    setResults(null);
  };

  const handleCheck = async () => {
    if (selected.length === 0) return toast.error('Please select at least one symptom');
    setLoading(true);
    try {
      const { data } = await api.post('/symptoms/check', { symptoms: selected });
      setResults(data.results);
      if (data.results.length === 0) toast('No matching diseases found. Please consult a doctor.', { icon: 'ℹ️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = allSymptoms.filter((s) => s.toLowerCase().includes(search.toLowerCase()));

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'bg-red-500';
    if (conf >= 65) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getConfidenceBg = (conf) => {
    if (conf >= 80) return 'border-red-200 bg-red-50';
    if (conf >= 65) return 'border-orange-200 bg-orange-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  if (fetchingSymptoms) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Symptom Checker</h2>
        <p className="text-gray-500 text-sm mt-1">Select your symptoms to get probable disease suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptoms selector */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Select Symptoms</h3>
            {selected.length > 0 && (
              <button onClick={() => setSelected([])} className="text-xs text-red-500 hover:underline">
                Clear all ({selected.length})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
              placeholder="Search symptoms..."
            />
          </div>

          {/* Symptom chips */}
          <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
            {filtered.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-150 capitalize ${
                  selected.includes(symptom)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {selected.includes(symptom) && '✓ '}{symptom}
              </button>
            ))}
          </div>

          {/* Selected list */}
          {selected.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Selected ({selected.length}):</p>
              <div className="flex flex-wrap gap-1">
                {selected.map((s) => (
                  <span key={s} className="badge-approved capitalize text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={loading || selected.length === 0}
            className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </div>

        {/* Results */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Diagnosis Results</h3>

          {!results && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg className="h-20 w-20 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm text-center">Select symptoms and click<br/>"Analyze Symptoms" to see results</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Spinner size="lg" />
              <p className="text-gray-500 text-sm mt-3">Analyzing your symptoms...</p>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                ⚠️ <strong>Disclaimer:</strong> These are AI-based suggestions only. Please consult a qualified doctor for proper diagnosis.
              </p>
              {results.map((r, idx) => (
                <div key={idx} className={`rounded-xl border p-4 ${getConfidenceBg(r.confidence)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800 text-sm">{r.disease}</p>
                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColor(r.confidence)}`}>
                      {r.confidence}%
                    </span>
                  </div>
                  {/* Confidence bar */}
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getConfidenceColor(r.confidence)}`}
                      style={{ width: `${r.confidence}%` }}
                    />
                  </div>
                  <p className="text-gray-600 text-xs mb-2">{r.description}</p>
                  {r.matchedSymptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.matchedSymptoms.map((s) => (
                        <span key={s} className="bg-white bg-opacity-70 text-gray-600 text-xs px-2 py-0.5 rounded-full border capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No matching diseases found for the selected symptoms.</p>
              <p className="text-xs mt-1">Please consult a doctor for evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
