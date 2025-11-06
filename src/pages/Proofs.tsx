import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, Clock, X, Camera, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { saveProof, getAllProofs, updateProofStatus, type ProofDocument } from "@/lib/indexedDB";

const Proofs = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [recipient, setRecipient] = useState("HOD AIML");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [localProofs, setLocalProofs] = useState<ProofDocument[]>([]);
  const [dbProofs, setDbProofs] = useState<any[]>([]);
  const [viewingProof, setViewingProof] = useState<ProofDocument | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const { role, loading: roleLoading } = useUserRole();

  const isStudent = role === 'student';
  const isFaculty = role === 'faculty';

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [navigate]);

  // Load proofs from IndexedDB and Supabase
  useEffect(() => {
    loadProofs();
  }, [role]);

  const loadProofs = async () => {
    try {
      // Load from IndexedDB
      const local = await getAllProofs();
      setLocalProofs(local);

      // Load from Supabase
      if (isStudent) {
        const { data, error } = await supabase
          .from('proofs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDbProofs(data || []);
      } else if (isFaculty) {
        const { data, error } = await supabase
          .from('proofs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDbProofs(data || []);
      }
    } catch (error) {
      console.error('Error loading proofs:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or PDF file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !category || !recipient) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        try {
          // Call edge function to verify document
          const { data: verification, error: functionError } = await supabase.functions.invoke('verify-proof', {
            body: { imageData, title, category, recipient }
          });

          if (functionError) throw functionError;

          console.log('Verification result:', verification);

          // Save to Supabase with recipient
          const { data: proofData, error: insertError } = await supabase
            .from('proofs')
            .insert({
              student_id: user.id,
              title,
              category,
              recipient,
              document_data: imageData,
              ai_analysis: verification.analysis,
              status: verification.matches ? 'pending' : 'rejected',
              rejection_reason: verification.matches ? null : verification.reason
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Save to IndexedDB
          const proofDoc: ProofDocument = {
            id: proofData.id,
            title,
            category,
            imageData,
            status: verification.matches ? 'pending' : 'rejected',
            timestamp: Date.now(),
            aiAnalysis: verification.analysis,
            rejectionReason: verification.matches ? undefined : verification.reason
          };
          await saveProof(proofDoc);

          toast({
            title: verification.matches ? "Document verified!" : "Document rejected",
            description: verification.matches 
              ? "Your proof has been submitted for faculty approval"
              : `Reason: ${verification.reason}`,
            variant: verification.matches ? "default" : "destructive"
          });

          // Reset form
          setTitle("");
          setCategory("");
          setRecipient("HOD AIML");
          setSelectedFile(null);
          setPreviewUrl("");
          loadProofs();
        } catch (error: any) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: error.message || "Please try again",
            variant: "destructive"
          });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const handleFacultyAction = async (proofId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase
        .from('proofs')
        .update({
          status: action,
          rejection_reason: reason,
          faculty_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', proofId);

      if (error) throw error;

      // Update local storage
      await updateProofStatus(proofId, action, reason);

      toast({
        title: action === 'approved' ? "Proof approved" : "Proof rejected",
        description: action === 'approved' ? "Student has been notified" : "Student will see the rejection reason"
      });

      loadProofs();
    } catch (error: any) {
      console.error('Action error:', error);
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-success to-success/80 text-success-foreground p-6 elevation-3">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <h1 className="text-2xl font-bold">
              {isFaculty ? 'Proof Approvals' : 'Proof & Approvals'}
            </h1>
          </div>
          <p className="text-success-foreground/90">
            {isFaculty 
              ? 'Review and approve student document submissions' 
              : 'Upload documents for instant verification'}
          </p>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Student Upload Section */}
        {isStudent && (
          <Card className="p-6 elevation-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upload Proof</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., TechFest Registration Receipt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Leave Letter, Refund Permission, Event Registration"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="recipient">Send To</Label>
                  <select
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="HOD AIML">HOD AIML</option>
                    <option value="HOD CSE">HOD CSE</option>
                    <option value="HOD IT">HOD IT</option>
                    <option value="Accounts Department">Accounts Department</option>
                    <option value="Dean Academics">Dean Academics</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-3">
                  {uploading ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-success border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">Verifying document with AI...</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="space-y-3">
                      <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload Receipt or Form</p>
                        <p className="text-xs text-muted-foreground">AI will verify if it matches your category</p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" onClick={() => document.getElementById('file-input')?.click()}>
                          <Camera className="mr-2 w-4 h-4" />
                          Select File
                        </Button>
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {selectedFile && (
                  <Button onClick={handleUpload} disabled={uploading} className="w-full">
                    Submit for Verification
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Proofs List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {isFaculty ? 'Pending Approvals' : 'Recent Submissions'}
          </h3>
          <div className="space-y-3">
            {dbProofs.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {isFaculty ? 'No submissions yet' : 'No proofs submitted yet'}
                </p>
              </Card>
            ) : (
              dbProofs.map((proof) => (
                <Card key={proof.id} className="p-4 elevation-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          proof.status === "approved"
                            ? "bg-success/10"
                            : proof.status === "pending"
                            ? "bg-warning/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {proof.status === "approved" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : proof.status === "pending" ? (
                          <Clock className="w-5 h-5 text-warning" />
                        ) : (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                       <div className="flex-1">
                        <h4 className="font-medium text-sm">{proof.title}</h4>
                        <p className="text-xs text-muted-foreground">Category: {proof.category}</p>
                        <p className="text-xs font-medium text-primary">
                          Sent to: {proof.recipient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(proof.created_at).toLocaleDateString()}
                        </p>
                        {proof.ai_analysis && (
                          <p className="text-xs text-muted-foreground mt-1">
                            AI: {proof.ai_analysis}
                          </p>
                        )}
                        {proof.rejection_reason && (
                          <p className="text-xs text-destructive mt-1">
                            Reason: {proof.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const doc = localProofs.find(p => p.id === proof.id);
                          if (doc) setViewingProof(doc);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isFaculty && proof.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleFacultyAction(proof.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) handleFacultyAction(proof.id, 'rejected', reason);
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          proof.status === "approved"
                            ? "bg-success/10 text-success"
                            : proof.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {proof.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingProof && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingProof(null)}
        >
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{viewingProof.title}</h3>
                  <p className="text-sm text-muted-foreground">{viewingProof.category}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewingProof(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <img 
                src={viewingProof.imageData} 
                alt={viewingProof.title}
                className="w-full rounded"
              />
            </div>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Proofs;