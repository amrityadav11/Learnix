import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, CreditCard, AlertCircle, Loader, Check } from 'lucide-react';
import api from '../../api/axios';

export default function InstructorWithdrawPage() {
    const [withdrawalData, setWithdrawalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [showBankForm, setShowBankForm] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: ''
    });

    // Fetch withdrawal data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/instructor/withdrawals');
                setWithdrawalData(res.data.data);
                if (res.data.data.bankDetails) {
                    setBankDetails(res.data.data.bankDetails);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
            setError('Please update your bank details first');
            return;
        }

        try {
            const res = await api.post(
                '/instructor/withdraw',
                { amount: parseFloat(withdrawAmount) }
            );
            setSuccessMessage(res.data.message);
            setWithdrawalData(prev => ({
                ...prev,
                pendingEarnings: res.data.data.newPending,
                withdrawnEarnings: res.data.data.totalWithdrawn
            }));
            setWithdrawAmount('');
            setShowWithdrawForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const handleBankDetailsUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.put('/instructor/bank-details', bankDetails);
            setSuccessMessage('Bank details updated successfully');
            setShowBankForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update bank details');
        }
    };

    if (loading) return <div className="flex items-center justify-center p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Earnings & Withdrawals</h1>
                <p className="text-muted-foreground mt-2">Manage your earnings and withdraw funds</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </motion.div>
            )}

            {successMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{successMessage}</span>
                </motion.div>
            )}

            {withdrawalData && (
                <>
                    {/* Earnings Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <p className="text-4xl font-bold">${withdrawalData.totalEarnings?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium opacity-90">Pending Earnings</h3>
                                <Wallet className="w-6 h-6" />
                            </div>
                            <p className="text-4xl font-bold">${withdrawalData.pendingEarnings?.toLocaleString() || 0}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium opacity-90">Withdrawn</h3>
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <p className="text-4xl font-bold">${withdrawalData.withdrawnEarnings?.toLocaleString() || 0}</p>
                        </motion.div>
                    </div>

                    {/* Withdrawal Action */}
                    <div className="bg-card rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
                        {!showWithdrawForm ? (
                            <button
                                onClick={() => setShowWithdrawForm(true)}
                                disabled={!withdrawalData.pendingEarnings || withdrawalData.pendingEarnings === 0}
                                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Withdraw Funds
                            </button>
                        ) : (
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Withdrawal Amount (Available: ${withdrawalData.pendingEarnings?.toLocaleString()})
                                    </label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        max={withdrawalData.pendingEarnings}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Minimum: $10 | Maximum: ${withdrawalData.pendingEarnings?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
                                        Request Withdrawal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowWithdrawForm(false)}
                                        className="flex-1 px-6 py-3 rounded-lg bg-muted font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Bank Details */}
                    <div className="bg-card rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6">Bank Details</h2>

                        {!showBankForm && withdrawalData.bankDetails ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground">Account Holder</p>
                                        <p className="font-medium mt-1">{withdrawalData.bankDetails.accountHolderName}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground">Bank Name</p>
                                        <p className="font-medium mt-1">{withdrawalData.bankDetails.bankName}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground">Account Number</p>
                                        <p className="font-medium mt-1">****{withdrawalData.bankDetails.accountNumber?.slice(-4)}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground">IFSC Code</p>
                                        <p className="font-medium mt-1">{withdrawalData.bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowBankForm(true);
                                        setBankDetails(withdrawalData.bankDetails);
                                    }}
                                    className="px-6 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5"
                                >
                                    Edit Bank Details
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBankDetailsUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountHolderName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                        required
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankDetails.bankName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                        required
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                            required
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={bankDetails.ifscCode}
                                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                            required
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
                                        Save Bank Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBankForm(false)}
                                        className="flex-1 px-6 py-3 rounded-lg bg-muted font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
