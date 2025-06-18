import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInError } from './signin-error';
import { CredentialsForm } from './credentials-form';
import { MicrosoftSignIn } from './microsoft-signin';
import { SignInFooter } from './signin-footer';
import { SignInCardProps } from './types';

export const SignInCard = ({
  email,
  password,
  error,
  isLoading,
  setEmail,
  setPassword,
  handleCredentialsSignIn,
  handleMicrosoftSignIn,
  setDemoAccount
}: SignInCardProps) => {
  return (
    <Card className='shadow-lg border-0'>
      <CardHeader className='text-center pb-4'>
        <CardTitle className='text-xl font-semibold'>Sign In</CardTitle>
        <CardDescription>
          Choose your preferred sign-in method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='credentials' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='credentials'>Email & Password</TabsTrigger>
            <TabsTrigger value='microsoft'>Microsoft</TabsTrigger>
          </TabsList>

          <SignInError error={error} />

          <TabsContent value='credentials'>
            <CredentialsForm
              email={email}
              password={password}
              isLoading={isLoading}
              setEmail={setEmail}
              setPassword={setPassword}
              handleSubmit={handleCredentialsSignIn}
              setDemoAccount={setDemoAccount}
            />
          </TabsContent>

          <TabsContent value='microsoft'>
            <MicrosoftSignIn
              isLoading={isLoading}
              handleMicrosoftSignIn={handleMicrosoftSignIn}
            />
          </TabsContent>
        </Tabs>

        <SignInFooter />
      </CardContent>
    </Card>
  );
}; 