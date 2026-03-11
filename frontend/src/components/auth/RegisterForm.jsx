import { SignUp } from '@clerk/clerk-react';

const RegisterForm = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400">
                        Join TheatreX to manage operating theatre schedules
                    </p>
                </div>

                {/* Clerk SignUp Component */}
                <div className="flex justify-center">
                    <SignUp
                        routing="path"
                        path="/register"
                        signInUrl="/login"
                        appearance={{
                            elements: {
                                card: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-4',
                                headerTitle: 'text-white font-bold text-2xl',
                                headerSubtitle: 'text-gray-300',
                                socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                                socialButtonsBlockButtonText: 'text-white',
                                formFieldLabel: 'text-gray-300 font-medium',
                                formFieldInput: 'bg-white/10 border-white/30 text-white placeholder-gray-400 rounded-lg focus:ring-blue-500',
                                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                                footerActionLink: 'text-blue-400 hover:text-blue-300 font-semibold',
                                footerActionText: 'text-gray-400',
                                dividerText: 'text-gray-400',
                                dividerLine: 'bg-white/20',
                                identityPreviewText: 'text-white',
                                identityPreviewEditButtonIcon: 'text-blue-400'
                            },
                            variables: {
                                colorPrimary: '#2563EB',
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;

