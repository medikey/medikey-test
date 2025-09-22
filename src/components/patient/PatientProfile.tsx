import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMediKey, generateKeyPair } from '@/contexts/MediKeyContext';
import { Shield, Key, RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function PatientProfile() {
  const { state, dispatch } = useMediKey();
  const { toast } = useToast();
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);

  const handleRegenerateKeys = () => {
    const { publicKey, privateKey } = generateKeyPair();

    dispatch({
      type: 'SET_USER',
      payload: {
        ...state.currentUser!,
        publicKey,
        privateKey
      }
    });

    // Add activity log
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Math.random().toString(36),
        userId: publicKey,
        action: 'access_request',
        description: 'Regenerated cryptographic keys',
        timestamp: new Date()
      }
    });

    toast({
      title: 'Keys Regenerated',
      description: 'Your new cryptographic keys have been generated successfully.',
    });
  };

  const copyToClipboard = async (text: string, type: 'public' | 'private') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'public') {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
      }
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

  if (!state.currentUser) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Patient Profile</h1>
        <p className="text-muted-foreground">
          Manage your cryptographic keys and account settings
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Identity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Identity</span>
            </CardTitle>
            <CardDescription>
              Your secure patient identifier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                Patient Account
              </Badge>
              {state.currentUser.name && (
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium">Patient Name</p>
                  <p className="text-lg font-semibold">{state.currentUser.name}</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">Patient ID</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {state.currentUser.publicKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(state.currentUser.publicKey, 'public')}
                  >
                    {copiedPublic ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Security Status</p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Keys Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Key Management</span>
            </CardTitle>
            <CardDescription>
              Manage your cryptographic keys securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Private Key</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                  {state.currentUser.privateKey.substring(0, 20)}...
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(state.currentUser.privateKey, 'private')}
                >
                  {copiedPrivate ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your private key secure and never share it
              </p>
            </div>

            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Keys
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate Cryptographic Keys?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will generate new public and private keys. Your current keys will be invalidated and you will lose access to previously shared records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRegenerateKeys}>
                      Regenerate Keys
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your MediKey activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{state.records.length}</div>
              <div className="text-sm text-muted-foreground">Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {state.accessGrants.filter(g => g.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {state.payments.filter(p => p.status === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{state.activityLog.length}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}