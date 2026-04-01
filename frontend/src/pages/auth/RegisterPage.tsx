import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Heart, Loader2, Copy, Check } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    role: z.string(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const AnimatedSphere = () => (
    <Sphere args={[1, 100, 200]} scale={2.4}>
        <MeshDistortMaterial color="#3B82F6" attach="material" distort={0.4} speed={1.5} roughness={0} />
    </Sphere>
);

const demoCredentials = [
    { role: 'Admin', email: 'admin@medlife.com', password: 'admin123', color: '#F59E0B' },
    { role: 'Doctor', email: 'doctor@medlife.com', password: 'doctor123', color: '#6366F1' },
    { role: 'Patient', email: 'patient@medlife.com', password: 'patient123', color: '#10B981' },
];

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={handleCopy} className="ml-1.5 p-0.5 rounded transition-all" style={{ color: copied ? '#10B981' : '#475569' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
    );
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { registerAction, isLoading, error, clearError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'PATIENT' }
    });

    const onSubmit = async (data: RegisterFormValues) => {
        clearError();
        const success = await registerAction(data);
        if (success) {
            navigate('/');
        }
    };

    const fillCredentials = (email: string, password: string) => {
        setValue('email', email);
        setValue('password', password);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
            {/* 3D Background */}
            <div className="absolute inset-0 z-0 opacity-60">
                <Canvas>
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[10, 10, 5]} intensity={0.8} />
                    <pointLight position={[-10, -10, -5]} intensity={0.3} color="#818CF8" />
                    <AnimatedSphere />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 z-0">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            background: `rgba(99, 102, 241, ${0.3 + Math.random() * 0.3})`,
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                        }}
                        animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                ))}
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
                    borderRadius: '1rem',
                }}>
                    <CardHeader className="space-y-3 pb-2">
                        <motion.div className="flex justify-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                                <Heart className="w-7 h-7 text-white" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-center text-white">MedLife Registration</CardTitle>
                        <CardDescription className="text-center" style={{ color: '#94A3B8' }}>
                            Create your patient account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-sm text-red-400 text-center p-3 rounded-lg"
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Full Name</Label>
                                <Input id="name" type="text" placeholder="John Doe" {...register('name')}
                                    style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#E2E8F0', borderRadius: '0.75rem', height: '2.75rem' }} />
                                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Email</Label>
                                <Input id="email" type="email" placeholder="doctor@medlife.com" {...register('email')}
                                    style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#E2E8F0', borderRadius: '0.75rem', height: '2.75rem' }} />
                                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')}
                                        style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#E2E8F0', borderRadius: '0.75rem', height: '2.75rem', paddingRight: '2.5rem' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                            </div>

                            <Button type="submit" className="w-full h-11 mt-2 text-sm font-semibold text-white" disabled={isLoading}
                                style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)', borderRadius: '0.75rem', border: 'none' }}>
                                {isLoading ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Registering...</span>) : 'Sign Up'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-6 mt-2">
                        <p className="text-sm" style={{ color: '#64748B' }}>
                            Already have an account?{' '}<span onClick={() => navigate('/login')} className="hover:underline cursor-pointer" style={{ color: '#818CF8' }}>Sign In here</span>
                        </p>
                    </CardFooter>
                </Card>

                {/* Demo credentials with copy */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 p-4 rounded-xl"
                    style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(99, 102, 241, 0.15)' }}
                >
                    <p className="text-xs font-semibold mb-3 text-center" style={{ color: '#94A3B8' }}>🔑 Demo Credentials — Click to autofill</p>
                    <div className="space-y-2">
                        {demoCredentials.map((cred) => (
                            <button
                                key={cred.role}
                                type="button"
                                onClick={() => fillCredentials(cred.email, cred.password)}
                                className="w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all hover:scale-[1.01]"
                                style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: cred.color, background: `${cred.color}15` }}>
                                        {cred.role}
                                    </span>
                                    <div>
                                        <span className="text-xs font-mono" style={{ color: '#CBD5E1' }}>Use same credentials for test</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-medium px-2 py-1 rounded-md" style={{ color: '#818CF8', background: 'rgba(99,102,241,0.1)' }}>
                                    Info
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
