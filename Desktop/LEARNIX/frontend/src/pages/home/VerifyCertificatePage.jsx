import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, CheckCircle, GraduationCap, Download } from 'lucide-react';

export default function VerifyCertificatePage() {
    const { id } = useParams();
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement API call to fetch certificate
        setLoading(false);
    }, [id]);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!cert) return <div className="text-center py-20">Certificate not found</div>;

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4">Verify Certificate</h1>
                    <p className="text-muted-foreground">Certificate ID: {cert.certificateId}</p>
                </div>

                <div className="bg-card p-8 rounded-2xl border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">Certificate of Completion</h2>
                                <p className="text-sm text-muted-foreground">LEARNIX</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{new Date(cert.completionDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-muted-foreground mb-2">This certifies that</p>
                        <h3 className="text-3xl font-bold mb-4">{cert.studentName}</h3>
                        <p className="text-lg text-primary mb-2">has successfully completed</p>
                        <h4 className="text-2xl font-semibold">{cert.courseName}</h4>
                        <p className="text-sm text-muted-foreground mt-2">Instructor: {cert.instructorName}</p>
                    </div>

                    <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="h-px bg-border w-24 mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Authorized Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="h-px bg-border w-24 mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">LEARNIX</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button className="px-6 py-2 rounded-lg border border-border hover:bg-muted font-medium flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => window.open(`https://learnix.com/verify-certificate/${cert.certificateId}`, '_blank')}
                            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                        >
                            Share Certificate
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-muted/30 rounded-xl">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Certificate Verification
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            This certificate can be verified at: <span className="font-mono text-primary">{window.location.href}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
