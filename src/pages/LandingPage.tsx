import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMediKey, generateKeyPair } from '@/contexts/MediKeyContext';
import type { UserRole } from '@/types/medikey';
import { Shield, Key, Users, Activity } from 'lucide-react';

export function LandingPage() {
  const { dispatch } = useMediKey();
  const [keyInput, setKeyInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    // Simulate key generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { publicKey, privateKey } = generateKeyPair();
    setKeyInput(publicKey);
    setIsGenerating(false);
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

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>Access MediKey</CardTitle>
              <CardDescription>
                Enter your cryptographic key or generate a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    {isGenerating ? 'Generating...' : 'Generate'}
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