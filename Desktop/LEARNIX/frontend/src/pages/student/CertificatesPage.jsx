import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Download, Award, Calendar, Search, Filter } from 'lucide-react';
import { fetchCertificates } from '../../redux/slices/certificateSlice';
import LoadingScreen from '../../components/common/LoadingScreen';

const CertificatesPage = () => {
    const dispatch = useDispatch();
    const { certificates, loading, error } = useSelector((state) => state.certificates || { certificates: [], loading: false, error: null });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        dispatch(fetchCertificates());
    }, [dispatch]);

    const filteredCertificates = certificates.filter((cert) => {
        const matchesSearch = cert.courseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || cert.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleDownload = (certificateId) => {
        // Implementation for downloading certificate
        window.open(`/api/certificates/${certificateId}/download`, '_blank');
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
                        <p className="text-gray-600">Track and download your course completion certificates</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search certificates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="completion">Completion</option>
                            <option value="achievement">Achievement</option>
                            <option value="participation">Participation</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterType !== 'all'
                                ? 'No certificates match your search criteria.'
                                : 'Complete courses to earn certificates.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredCertificates.map((certificate) => (
                        <div key={certificate._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${certificate.type === 'completion' ? 'bg-green-100' :
                                        certificate.type === 'achievement' ? 'bg-blue-100' : 'bg-purple-100'
                                    }`}>
                                    <Award className={`w-6 h-6 ${certificate.type === 'completion' ? 'text-green-600' :
                                            certificate.type === 'achievement' ? 'text-blue-600' : 'text-purple-600'
                                        }`} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${certificate.type === 'completion' ? 'bg-green-100 text-green-700' :
                                        certificate.type === 'achievement' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {certificate.type.charAt(0).toUpperCase() + certificate.type.slice(1)}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {certificate.courseName}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <Calendar className="w-4 h-4" />
                                Completed on {new Date(certificate.completedAt).toLocaleDateString()}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Score:</span>
                                    <span className="font-medium text-gray-900">
                                        {certificate.score || 'N/A'}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Instructor:</span>
                                    <span className="font-medium text-gray-900">
                                        {certificate.instructorName}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(certificate._id)}
                                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Certificate
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Stats */}
            {certificates.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">{certificates.length}</div>
                            <div className="text-blue-100">Total Certificates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">
                                {certificates.filter(c => c.type === 'completion').length}
                            </div>
                            <div className="text-blue-100">Course Completions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">
                                {Math.round(certificates.reduce((acc, cert) => acc + (cert.score || 0), 0) / certificates.length) || 0}%
                            </div>
                            <div className="text-blue-100">Average Score</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatesPage;