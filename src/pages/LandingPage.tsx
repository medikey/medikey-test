import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMediKey, generateKeyPair, generateId } from '@/contexts/MediKeyContext';
import type { UserRole } from '@/types/medikey';
import { Shield, Key, Users, Activity, UserPlus, LogIn, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function LandingPage() {
  const { dispatch } = useMediKey();
  const { toast } = useToast();

  // Login state
  const [keyInput, setKeyInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [isGenerating, setIsGenerating] = useState(false);

  // Create account state
  const [newAccount, setNewAccount] = useState<{
    publicKey: string;
    privateKey: string;
    role: UserRole;
    name: string;
  } | null>(null);
  const [accountName, setAccountName] = useState('');
  const [newAccountRole, setNewAccountRole] = useState<UserRole>('patient');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'public' | 'private' | null>(null);

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    // Simulate key generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { publicKey, privateKey } = generateKeyPair();
    setKeyInput(publicKey);
    setIsGenerating(false);
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) return;

    setIsCreating(true);

    try {
      // Simulate account creation process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { publicKey, privateKey } = generateKeyPair();

      const account = {
        publicKey,
        privateKey,
        role: newAccountRole,
        name: accountName.trim()
      };

      setNewAccount(account);

      toast({
        title: 'Nostr Account Created!',
        description: 'Your new healthcare identity has been generated successfully.',
      });

    } catch (error) {
      toast({
        title: 'Account Creation Failed',
        description: 'There was an error creating your account.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUseNewAccount = () => {
    if (!newAccount) return;

    dispatch({
      type: 'SET_USER',
      payload: {
        publicKey: newAccount.publicKey,
        privateKey: newAccount.privateKey,
        role: newAccount.role,
        name: newAccount.name
      }
    });

    // Add welcome activity
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: generateId(),
        userId: newAccount.publicKey,
        action: 'access_request',
        description: `Created new ${newAccount.role} account: ${newAccount.name}`,
        timestamp: new Date()
      }
    });
  };

  const handleLogin = () => {
    if (!keyInput.trim()) return;

    // For mock purposes, extract or generate private key
    let privateKey = '';
    if (keyInput.startsWith('pk_')) {
      // If it's a public key, generate a corresponding private key
      privateKey = 'sk_' + keyInput.substring(3);
    } else if (keyInput.startsWith('sk_')) {
      // If it's a private key, derive public key
      privateKey = keyInput;
      setKeyInput('pk_' + keyInput.substring(3));
    } else {
      // Generate both
      const keys = generateKeyPair();
      setKeyInput(keys.publicKey);
      privateKey = keys.privateKey;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        publicKey: keyInput.startsWith('pk_') ? keyInput : 'pk_' + keyInput.substring(3),
        privateKey,
        role: selectedRole
      }
    });
  };

  const copyToClipboard = async (text: string, type: 'public' | 'private') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
      toast({
        title: 'Copied!',
        description: `${type === 'public' ? 'Public' : 'Private'} key copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary rounded-xl">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">MediKey</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Decentralized Health Records Powered by Bitcoin + Nostr
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Secure, private, and patient-controlled healthcare data management
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-accent/50">
            <CardHeader className="text-center">
              <Key className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Cryptographic Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Your medical records are secured with public-key cryptography, ensuring only you control access.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/50">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Patients control their data while clinicians access only what they need with permission.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/50">
            <CardHeader className="text-center">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Lightning Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Instant micropayments for record verification and secure storage using Bitcoin Lightning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Authentication */}
        <div className="max-w-lg mx-auto">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>Access MediKey</CardTitle>
              <CardDescription>
                Sign in with existing keys or create a new Nostr healthcare identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="login" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="key-input">Cryptographic Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="key-input"
                        placeholder="Enter your public key (pk_...) or private key (sk_...)"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={handleGenerateKeys}
                        disabled={isGenerating}
                        className="shrink-0"
                      >
                        {isGenerating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keys starting with "pk_" are public keys, "sk_" are private keys
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>I am a...</Label>
                    <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patient" id="patient" />
                        <Label htmlFor="patient" className="flex-1 cursor-pointer">
                          <div>
                            <div className="font-medium">Patient</div>
                            <div className="text-sm text-muted-foreground">
                              Upload and manage your health records
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clinician" id="clinician" />
                        <Label htmlFor="clinician" className="flex-1 cursor-pointer">
                          <div>
                            <div className="font-medium">Clinician</div>
                            <div className="text-sm text-muted-foreground">
                              Access patient records with permission
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleLogin}
                    className="w-full"
                    disabled={!keyInput.trim()}
                  >
                    Access Dashboard
                  </Button>
                </TabsContent>

                {/* Create Account Tab */}
                <TabsContent value="create" className="space-y-6 mt-6">
                  {!newAccount ? (
                    <>
                      <Alert className="border-blue-200 bg-blue-50">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          Create a new healthcare identity with automatically generated cryptographic keys
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-name">Full Name</Label>
                          <Input
                            id="account-name"
                            placeholder="Enter your full name"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            This will be associated with your healthcare identity
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label>Account Type</Label>
                          <RadioGroup value={newAccountRole} onValueChange={(value) => setNewAccountRole(value as UserRole)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="patient" id="new-patient" />
                              <Label htmlFor="new-patient" className="flex-1 cursor-pointer">
                                <div>
                                  <div className="font-medium">Patient Account</div>
                                  <div className="text-sm text-muted-foreground">
                                    Manage your personal health records
                                  </div>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="clinician" id="new-clinician" />
                              <Label htmlFor="new-clinician" className="flex-1 cursor-pointer">
                                <div>
                                  <div className="font-medium">Clinician Account</div>
                                  <div className="text-sm text-muted-foreground">
                                    Access patient records with permission
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <Button
                          onClick={handleCreateAccount}
                          disabled={!accountName.trim() || isCreating}
                          className="w-full"
                        >
                          {isCreating ? 'Creating Account...' : 'Create Nostr Healthcare ID'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Account Created Successfully!</strong> Your Nostr healthcare identity has been generated.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Account Details</Label>
                          <div className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Name:</span>
                              <span className="text-sm">{newAccount.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Role:</span>
                              <span className="text-sm capitalize">{newAccount.role}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Public Key (Healthcare ID)</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={newAccount.publicKey}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(newAccount.publicKey, 'public')}
                              className="shrink-0"
                            >
                              {copiedKey === 'public' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Private Key (Keep Secret)</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={newAccount.privateKey}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(newAccount.privateKey, 'private')}
                              className="shrink-0"
                            >
                              {copiedKey === 'private' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-destructive">
                            ⚠️ Save your private key securely. You'll need it to access your account.
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <Button
                            onClick={handleUseNewAccount}
                            className="w-full"
                          >
                            Enter MediKey Dashboard
                          </Button>

                          <p className="text-xs text-muted-foreground text-center">
                            Make sure to save your keys before proceeding
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            Built for healthcare privacy and security
          </p>
          <p className="text-xs text-muted-foreground">
            Vibed with{' '}
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MKStack
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}